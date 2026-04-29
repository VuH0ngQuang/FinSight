package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.StockEntity.StockYearData;

import java.util.HashMap;
import java.util.Map;

/**
 * Deep-clone helper for StockEntity. The backtest engine mutates clones heavily
 * (drops future yearData, rewrites matchPrice and industry ratios, re-runs
 * valuations) so every clone must be fully independent of the JPA-managed
 * originals AND of other clones.
 *
 * Non-trivial fields:
 *   - yearData: map is recreated; each StockYearData is field-copied
 *   - favoredByUsers: intentionally NOT cloned (it's a JPA ManyToMany set, read-only for backtest)
 */
public final class StockEntityCloner {

    private StockEntityCloner() {}

    public static StockEntity clone(StockEntity src) {
        if (src == null) return null;
        StockEntity c = new StockEntity();
        c.setStockId(src.getStockId());
        c.setStockName(src.getStockName());
        c.setSector(src.getSector());
        c.setMatchPrice(src.getMatchPrice());
        c.setPeRatio(src.getPeRatio());
        c.setPbRatio(src.getPbRatio());
        c.setPcfRatio(src.getPcfRatio());
        c.setPsRatio(src.getPsRatio());
        c.setIndustryPeRatio(src.getIndustryPeRatio());
        c.setIndustryPbRatio(src.getIndustryPbRatio());
        c.setIndustryPcfRatio(src.getIndustryPcfRatio());
        c.setIndustryPsRatio(src.getIndustryPsRatio());

        Map<Integer, StockYearData> yd = new HashMap<>();
        if (src.getYearData() != null) {
            for (Map.Entry<Integer, StockYearData> e : src.getYearData().entrySet()) {
                yd.put(e.getKey(), cloneYearData(e.getValue()));
            }
        }
        c.setYearData(yd);
        return c;
    }

    public static StockYearData cloneYearData(StockYearData s) {
        if (s == null) return null;
        StockYearData d = new StockYearData();
        d.setNetIncome(s.getNetIncome());
        d.setTotalEquity(s.getTotalEquity());
        d.setIntangibles(s.getIntangibles());
        d.setOperatingCashFlow(s.getOperatingCashFlow());
        d.setFreeCashFlow(s.getFreeCashFlow());
        d.setRevenue(s.getRevenue());
        d.setDividendPerShare(s.getDividendPerShare());
        d.setSharesOutstanding(s.getSharesOutstanding());
        d.setPriceEndYear(s.getPriceEndYear());
        d.setCostOfEquity(s.getCostOfEquity());
        d.setWacc(s.getWacc());
        d.setDividendGrowthRate(s.getDividendGrowthRate());
        d.setDdm(s.getDdm());
        d.setDcf(s.getDcf());
        d.setRi(s.getRi());
        d.setPe(s.getPe());
        d.setPbv(s.getPbv());
        d.setPcf(s.getPcf());
        d.setPs(s.getPs());
        return d;
    }
}
