package com.finsight.marketrealtime.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.dto.*;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.repository.AhpConfigRepository;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.service.PortfolioAllocationService;
import com.finsight.marketrealtime.valuation.TopsisCalculator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class PortfolioAllocationServiceImpl implements PortfolioAllocationService {
    private static final Logger logger = LoggerFactory.getLogger(PortfolioAllocationServiceImpl.class);

    private final StockRepository stockRepository;
    private final AhpConfigRepository ahpConfigRepository;
    private final TopsisCalculator topsisCalculator;
    private final ObjectMapper objectMapper;

    @Autowired
    public PortfolioAllocationServiceImpl(
            StockRepository stockRepository,
            AhpConfigRepository ahpConfigRepository,
            TopsisCalculator topsisCalculator,
            ObjectMapper objectMapper) {
        this.stockRepository = stockRepository;
        this.ahpConfigRepository = ahpConfigRepository;
        this.topsisCalculator = topsisCalculator;
        this.objectMapper = objectMapper;
    }

    @Override
    public ResponseDto allocate(PortfolioAllocationRequest request) {
        if (request.getBudget() == null || request.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
            return errorResponse(400, "Budget must be positive");
        }
        if (request.getNumberOfStocks() <= 0) {
            return errorResponse(400, "Number of stocks must be positive");
        }
        int lotSize = request.getLotSize() > 0 ? request.getLotSize() : 100;

        AhpConfigEntity ahpConfig = ahpConfigRepository.findByUserUserId(request.getUserId());
        if (ahpConfig == null) {
            return errorResponse(404, "AHP config not found for user: " + request.getUserId());
        }

        double[] weights;
        try {
            weights = objectMapper.readValue(ahpConfig.getWeightsJson(), double[].class);
        } catch (Exception e) {
            logger.error("Failed to parse AHP weights for user {}", request.getUserId(), e);
            return errorResponse(500, "Failed to parse AHP weights");
        }

        List<StockEntity> allStocks = stockRepository.findAllWithYearData();
        if (allStocks.isEmpty()) {
            return errorResponse(404, "No stocks available in the system");
        }

        List<RankedStockDto> ranked = topsisCalculator.rank(allStocks, weights);
        if (ranked.isEmpty()) {
            return errorResponse(404, "No stocks have sufficient data for ranking");
        }

        PortfolioAllocationResult result = buildAllocation(
                ranked, request.getBudget(), request.getNumberOfStocks(), lotSize);

        return ResponseDto.builder()
                .success(true)
                .data(result)
                .build();
    }

    /**
     * Core allocation algorithm:
     *  1. Select top-N stocks
     *  2. Distribute budget proportional to TOPSIS scores
     *  3. Floor to nearest lot
     *  4. Greedily assign residual budget to highest-scored affordable stocks
     *  5. Remove zero-share entries and back-fill from remaining ranked list
     */
    private PortfolioAllocationResult buildAllocation(
            List<RankedStockDto> ranked, BigDecimal budget, int n, int lotSize) {

        int available = Math.min(n, ranked.size());
        List<RankedStockDto> selected = new ArrayList<>(ranked.subList(0, available));

        // Price in VND (matchPrice is in thousands of VND on HOSE)
        BigDecimal thousand = BigDecimal.valueOf(1000);

        // --- Step 1: Score-proportional initial allocation ---
        double totalScore = selected.stream().mapToDouble(RankedStockDto::getTopsisScore).sum();
        int[] shares = new int[selected.size()];
        BigDecimal spent = BigDecimal.ZERO;

        for (int i = 0; i < selected.size(); i++) {
            RankedStockDto stock = selected.get(i);
            BigDecimal priceVnd = stock.getMatchPrice().multiply(thousand);

            double proportion = stock.getTopsisScore() / totalScore;
            BigDecimal allocatedBudget = budget.multiply(BigDecimal.valueOf(proportion));

            int lots = allocatedBudget
                    .divide(priceVnd.multiply(BigDecimal.valueOf(lotSize)), 0, RoundingMode.DOWN)
                    .intValue();
            shares[i] = lots * lotSize;
            spent = spent.add(priceVnd.multiply(BigDecimal.valueOf(shares[i])));
        }

        // --- Step 2: Greedy residual allocation ---
        BigDecimal remaining = budget.subtract(spent);
        boolean bought = true;
        while (bought && remaining.compareTo(BigDecimal.ZERO) > 0) {
            bought = false;
            for (int i = 0; i < selected.size(); i++) {
                BigDecimal lotCost = selected.get(i).getMatchPrice()
                        .multiply(thousand)
                        .multiply(BigDecimal.valueOf(lotSize));
                if (remaining.compareTo(lotCost) >= 0) {
                    shares[i] += lotSize;
                    remaining = remaining.subtract(lotCost);
                    bought = true;
                }
            }
        }

        // --- Step 3: Back-fill if any stocks ended with 0 shares ---
        int nextCandidate = available;
        for (int i = 0; i < selected.size(); i++) {
            if (shares[i] == 0 && nextCandidate < ranked.size()) {
                RankedStockDto replacement = ranked.get(nextCandidate);
                BigDecimal lotCost = replacement.getMatchPrice()
                        .multiply(thousand)
                        .multiply(BigDecimal.valueOf(lotSize));
                if (remaining.compareTo(lotCost) >= 0) {
                    selected.set(i, replacement);
                    shares[i] = lotSize;
                    remaining = remaining.subtract(lotCost);
                }
                nextCandidate++;
            }
        }

        // --- Step 4: Build result ---
        BigDecimal totalInvestment = BigDecimal.ZERO;
        List<StockAllocationDto> allocations = new ArrayList<>();

        for (int i = 0; i < selected.size(); i++) {
            if (shares[i] <= 0) continue;

            RankedStockDto stock = selected.get(i);
            BigDecimal priceVnd = stock.getMatchPrice().multiply(thousand);
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

        // Compute allocation percentages
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

    private ResponseDto errorResponse(int code, String message) {
        return ResponseDto.builder()
                .success(false)
                .errorCode(code)
                .errorMessage(message)
                .build();
    }
}
