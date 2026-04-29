package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.dto.PortfolioAllocationResult;
import com.finsight.marketrealtime.dto.RankedStockDto;

import java.util.ArrayList;
import java.util.List;

/**
 * Per-year log of the TOPSIS ranking (top slice) and the actual allocation taken.
 */
public class RebalanceLog {
    public record Entry(int year, List<RankedStockDto> topRanked, PortfolioAllocationResult allocation) {}

    private final List<Entry> entries = new ArrayList<>();

    public void add(int year, List<RankedStockDto> ranked, PortfolioAllocationResult alloc) {
        // Keep only the top-50 of the ranking to cap log size (full ranking is not needed downstream)
        int cap = Math.min(50, ranked.size());
        entries.add(new Entry(year, new ArrayList<>(ranked.subList(0, cap)), alloc));
    }

    public List<Entry> entries() {
        return entries;
    }
}
