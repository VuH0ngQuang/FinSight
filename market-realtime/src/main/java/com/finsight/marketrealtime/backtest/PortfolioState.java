package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.dto.PortfolioAllocationResult;
import com.finsight.marketrealtime.dto.StockAllocationDto;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.StockEntity.StockYearData;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * Mutable portfolio state tracked across the backtest loop.
 *
 * Units:
 *   - cash is in VND (full denomination).
 *   - Positions are stored with shares and the last known price-per-share in VND
 *     (so mark-to-market / liquidate are straightforward multiplications).
 *
 * Prices flow from the full-universe map keyed by stockId; year-end prices are
 * stored in StockEntity.yearData[year].priceEndYear (thousands of VND — we
 * convert to full VND consistently with PortfolioAllocator.allocate).
 */
public class PortfolioState {

    private static final BigDecimal THOUSAND = BigDecimal.valueOf(1000);
    private static final BigDecimal TEN_THOUSAND = BigDecimal.valueOf(10_000);

    private BigDecimal cash;
    private BigDecimal lastValue;
    private final Map<String, Position> holdings = new HashMap<>();
    private final Map<String, StockEntity> universe;

    public static PortfolioState cash(BigDecimal startingCash, Map<String, StockEntity> universe) {
        return new PortfolioState(startingCash, universe);
    }

    private PortfolioState(BigDecimal startingCash, Map<String, StockEntity> universe) {
        this.cash = startingCash;
        this.lastValue = startingCash;
        this.universe = universe;
    }

    public BigDecimal cash() { return cash; }

    public Map<String, Position> holdings() { return holdings; }

    /**
     * Re-value all current holdings at year-end prices for {@code year}.
     * Positions for which no priceEndYear is available fall back to their
     * last recorded price (stale-mark, logged only once in the engine).
     */
    public BigDecimal markToMarket(int year) {
        BigDecimal value = cash;
        for (Position p : holdings.values()) {
            BigDecimal px = priceAt(p.stockId(), year);
            if (px != null) {
                p.lastPriceVnd = px;
            }
            value = value.add(p.lastPriceVnd.multiply(BigDecimal.valueOf(p.shares)));
        }
        lastValue = value;
        return value;
    }

    public BigDecimal totalValue() {
        return lastValue;
    }

    /**
     * Sell all positions at year-end price for {@code year}. Transaction cost is
     * applied as a flat bps haircut on gross proceeds. Returns the net cash
     * available after the sale (which is then stored in {@link #cash}).
     */
    public BigDecimal liquidateAt(int year, int txCostBps) {
        BigDecimal gross = BigDecimal.ZERO;
        for (Position p : holdings.values()) {
            BigDecimal px = priceAt(p.stockId(), year);
            if (px == null) px = p.lastPriceVnd;
            gross = gross.add(px.multiply(BigDecimal.valueOf(p.shares)));
        }
        holdings.clear();
        BigDecimal costFactor = BigDecimal.ONE.subtract(
                BigDecimal.valueOf(txCostBps).divide(TEN_THOUSAND, 8, RoundingMode.HALF_UP));
        cash = cash.add(gross.multiply(costFactor));
        lastValue = cash;
        return cash;
    }

    /**
     * Apply a fresh allocation: deduct notional and transaction cost from cash,
     * install new positions priced at year-end {@code year}.
     */
    public void applyAllocation(PortfolioAllocationResult alloc, int year, int txCostBps) {
        if (alloc == null || alloc.getAllocations() == null) return;
        BigDecimal spent = BigDecimal.ZERO;
        for (StockAllocationDto a : alloc.getAllocations()) {
            if (a.getShares() <= 0) continue;
            BigDecimal px = a.getPricePerShare();
            if (px == null) px = BigDecimal.ZERO;
            Position p = new Position(a.getStockId(), a.getShares(), px);
            holdings.put(a.getStockId(), p);
            spent = spent.add(px.multiply(BigDecimal.valueOf(a.getShares())));
        }
        BigDecimal txCost = spent
                .multiply(BigDecimal.valueOf(txCostBps))
                .divide(TEN_THOUSAND, 8, RoundingMode.HALF_UP);
        cash = cash.subtract(spent).subtract(txCost);
        lastValue = markToMarket(year);
    }

    private BigDecimal priceAt(String stockId, int year) {
        StockEntity s = universe == null ? null : universe.get(stockId);
        if (s == null || s.getYearData() == null) return null;
        StockYearData yd = s.getYearData().get(year);
        if (yd == null || yd.getPriceEndYear() == null) return null;
        return yd.getPriceEndYear().multiply(THOUSAND);
    }

    public static final class Position {
        private final String stockId;
        private final int shares;
        private BigDecimal lastPriceVnd;

        public Position(String stockId, int shares, BigDecimal lastPriceVnd) {
            this.stockId = stockId;
            this.shares = shares;
            this.lastPriceVnd = lastPriceVnd;
        }
        public String stockId() { return stockId; }
        public int shares() { return shares; }
        public BigDecimal lastPriceVnd() { return lastPriceVnd; }
    }
}
