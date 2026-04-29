package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.model.StockEntity;

import java.util.List;

/**
 * Point-in-time view of the investable universe as it would have been observable
 * at year-end {@code asOfYear}. All StockEntities in the list are deep-clones with:
 *
 *   - yearData filtered to keys ≤ asOfYear
 *   - matchPrice bound to yearData[asOfYear].priceEndYear
 *   - stock-level peRatio/pbRatio/pcfRatio/psRatio recomputed from the as-of year's data
 *   - industryPeRatio/.../psRatio overwritten with the cross-section median within their sector
 *   - yearData[asOfYear].ddm/dcf/ri/pe/pbv/pcf/ps populated via StockValuationCalculator
 *
 * Stocks lacking priceEndYear or with fewer than two populated TOPSIS criteria at
 * asOfYear are excluded from {@link #stocks()}.
 */
public record HistoricalSnapshot(int asOfYear, List<StockEntity> stocks) {
}
