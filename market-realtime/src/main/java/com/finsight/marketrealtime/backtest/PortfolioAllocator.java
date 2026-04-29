package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.dto.PortfolioAllocationResult;
import com.finsight.marketrealtime.dto.RankedStockDto;
import com.finsight.marketrealtime.dto.StockAllocationDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure allocation algorithm extracted from PortfolioAllocationServiceImpl.buildAllocation().
 *
 * Behavior-preserving: identical score-proportional allocation with lot-size floor,
 * greedy residual filling, and zero-share back-fill from the remaining ranked list.
 *
 * No Spring coupling beyond @Component; safe to reuse from backtest engine and
 * production request paths alike.
 */
@Component
public class PortfolioAllocator {

    private static final BigDecimal THOUSAND = BigDecimal.valueOf(1000);

    /**
     * @param ranked       full ranked list (top-to-bottom) from TopsisCalculator
     * @param budget       total investable VND
     * @param n            desired number of positions
     * @param lotSize      exchange lot size (HOSE = 100)
     */
    public PortfolioAllocationResult allocate(List<RankedStockDto> ranked,
                                              BigDecimal budget,
                                              int n,
                                              int lotSize) {
        if (ranked == null || ranked.isEmpty() || budget == null
                || budget.compareTo(BigDecimal.ZERO) <= 0 || n <= 0) {
            return PortfolioAllocationResult.builder()
                    .allocations(List.of())
                    .totalInvestment(BigDecimal.ZERO)
                    .remainingBudget(budget == null ? BigDecimal.ZERO : budget)
                    .budget(budget == null ? BigDecimal.ZERO : budget)
                    .numberOfStocks(0)
                    .budgetUtilizationPercent(0)
                    .build();
        }

        int available = Math.min(n, ranked.size());
        List<RankedStockDto> selected = new ArrayList<>(ranked.subList(0, available));

        // --- Step 1: score-proportional initial allocation ---
        double totalScore = selected.stream().mapToDouble(RankedStockDto::getTopsisScore).sum();
        int[] shares = new int[selected.size()];
        BigDecimal spent = BigDecimal.ZERO;

        for (int i = 0; i < selected.size(); i++) {
            RankedStockDto stock = selected.get(i);
            BigDecimal priceVnd = stock.getMatchPrice().multiply(THOUSAND);

            double proportion = totalScore > 0 ? stock.getTopsisScore() / totalScore : 1.0 / selected.size();
            BigDecimal allocatedBudget = budget.multiply(BigDecimal.valueOf(proportion));

            int lots = allocatedBudget
                    .divide(priceVnd.multiply(BigDecimal.valueOf(lotSize)), 0, RoundingMode.DOWN)
                    .intValue();
            shares[i] = lots * lotSize;
            spent = spent.add(priceVnd.multiply(BigDecimal.valueOf(shares[i])));
        }

        // --- Step 2: greedy residual allocation ---
        BigDecimal remaining = budget.subtract(spent);
        boolean bought = true;
        while (bought && remaining.compareTo(BigDecimal.ZERO) > 0) {
            bought = false;
            for (int i = 0; i < selected.size(); i++) {
                BigDecimal lotCost = selected.get(i).getMatchPrice()
                        .multiply(THOUSAND)
                        .multiply(BigDecimal.valueOf(lotSize));
                if (remaining.compareTo(lotCost) >= 0) {
                    shares[i] += lotSize;
                    remaining = remaining.subtract(lotCost);
                    bought = true;
                }
            }
        }

        // --- Step 3: back-fill zero-share slots ---
        int nextCandidate = available;
        for (int i = 0; i < selected.size(); i++) {
            if (shares[i] == 0 && nextCandidate < ranked.size()) {
                RankedStockDto replacement = ranked.get(nextCandidate);
                BigDecimal lotCost = replacement.getMatchPrice()
                        .multiply(THOUSAND)
                        .multiply(BigDecimal.valueOf(lotSize));
                if (remaining.compareTo(lotCost) >= 0) {
                    selected.set(i, replacement);
                    shares[i] = lotSize;
                    remaining = remaining.subtract(lotCost);
                }
                nextCandidate++;
            }
        }

        // --- Step 4: build result ---
        BigDecimal totalInvestment = BigDecimal.ZERO;
        List<StockAllocationDto> allocations = new ArrayList<>();

        for (int i = 0; i < selected.size(); i++) {
            if (shares[i] <= 0) continue;
            RankedStockDto stock = selected.get(i);
            BigDecimal priceVnd = stock.getMatchPrice().multiply(THOUSAND);
            BigDecimal cost = priceVnd.multiply(BigDecimal.valueOf(shares[i]));
            totalInvestment = totalInvestment.add(cost);

            allocations.add(StockAllocationDto.builder()
                    .stockId(stock.getStockId())
                    .stockName(stock.getStockName())
                    .shares(shares[i])
                    .pricePerShare(priceVnd)
                    .totalCost(cost)
                    .topsisScore(stock.getTopsisScore())
                    .build());
        }

        for (StockAllocationDto a : allocations) {
            if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
                double pct = a.getTotalCost()
                        .divide(totalInvestment, 6, RoundingMode.HALF_UP)
                        .doubleValue() * 100;
                a.setAllocationPercentage(Math.round(pct * 100.0) / 100.0);
            }
        }

        double utilization = budget.compareTo(BigDecimal.ZERO) > 0
                ? totalInvestment.divide(budget, 6, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;

        return PortfolioAllocationResult.builder()
                .allocations(allocations)
                .totalInvestment(totalInvestment)
                .remainingBudget(budget.subtract(totalInvestment))
                .budget(budget)
                .numberOfStocks(allocations.size())
                .budgetUtilizationPercent(Math.round(utilization * 100.0) / 100.0)
                .build();
    }
}
