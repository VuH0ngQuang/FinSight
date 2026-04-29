package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.StockEntity.StockYearData;
import com.finsight.marketrealtime.valuation.StockValuationCalculator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds a point-in-time {@link HistoricalSnapshot} with strict anti-look-ahead rules:
 *
 *   1. Deep-clone every StockEntity in the universe.
 *   2. Drop yearData entries with key > asOfYear.
 *   3. Drop stocks that lack yearData[asOfYear] or its priceEndYear.
 *   4. Bind matchPrice = yearData[asOfYear].priceEndYear.
 *   5. Recompute stock-level peRatio/pbRatio/pcfRatio/psRatio from yearData[asOfYear]
 *      (so that live DB cache of current-period ratios cannot leak into the past).
 *   6. Compute per-sector medians of the recomputed ratios and overwrite the
 *      clone's industry* fields (the live cache value is discarded).
 *   7. Re-run {@link StockValuationCalculator#calculateAllValuations} against
 *      yearData[asOfYear] with history ≤ asOfYear so DDM/DCF/RI are derived from
 *      observable-at-the-time inputs only.
 *   8. Drop stocks that still have fewer than two usable TOPSIS criteria
 *      (matches TopsisCalculator.buildCriteriaRow eligibility threshold).
 */
@Component
public class SnapshotBuilder {

    private static final Logger logger = LoggerFactory.getLogger(SnapshotBuilder.class);

    private final StockValuationCalculator valuationCalculator;
    private final IndustryMedianCalculator industryMedianCalculator;

    public SnapshotBuilder(StockValuationCalculator valuationCalculator,
                           IndustryMedianCalculator industryMedianCalculator) {
        this.valuationCalculator = valuationCalculator;
        this.industryMedianCalculator = industryMedianCalculator;
    }

    public HistoricalSnapshot build(List<StockEntity> universe, int asOfYear) {
        List<StockEntity> clones = new ArrayList<>(universe.size());

        // --- Phase 1: clone, trim future years, bind price, compute stock-level ratios ---
        for (StockEntity src : universe) {
            StockEntity c = StockEntityCloner.clone(src);
            if (c == null || c.getYearData() == null) continue;

            c.getYearData().keySet().removeIf(y -> y > asOfYear);

            StockYearData current = c.getYearData().get(asOfYear);
            if (current == null || current.getPriceEndYear() == null
                    || current.getPriceEndYear().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            // matchPrice is kept in the same unit as production (thousands of VND)
            c.setMatchPrice(current.getPriceEndYear());

            // Recompute stock-level multiples from as-of year data, overwriting any
            // cached live-DB values that could have been carried in from the present.
            c.setPeRatio(valuationCalculator.calculatePE(current, null));
            c.setPbRatio(valuationCalculator.calculatePBV(current, null));
            c.setPcfRatio(valuationCalculator.calculatePCF(current, null));
            c.setPsRatio(valuationCalculator.calculatePS(current, null));

            // Clear industry ratios; they'll be rewritten from the cross-section below.
            c.setIndustryPeRatio(null);
            c.setIndustryPbRatio(null);
            c.setIndustryPcfRatio(null);
            c.setIndustryPsRatio(null);

            clones.add(c);
        }

        // --- Phase 2: per-sector medians from the cross-section ---
        Map<String, Map<String, BigDecimal>> mediansBySector =
                industryMedianCalculator.computeMediansBySector(clones);

        for (StockEntity c : clones) {
            Map<String, BigDecimal> m = mediansBySector.getOrDefault(c.getSector(), Map.of());
            c.setIndustryPeRatio(m.get("PE"));
            c.setIndustryPbRatio(m.get("PB"));
            c.setIndustryPcfRatio(m.get("PCF"));
            c.setIndustryPsRatio(m.get("PS"));
        }

        // --- Phase 3: intrinsic valuations using only ≤asOfYear data ---
        for (StockEntity c : clones) {
            StockYearData current = c.getYearData().get(asOfYear);
            StockYearData previous = c.getYearData().get(asOfYear - 1);

            List<StockYearData> history = new ArrayList<>();
            for (int y = c.getYearData().keySet().stream().mapToInt(Integer::intValue).min().orElse(asOfYear);
                 y <= asOfYear; y++) {
                StockYearData yd = c.getYearData().get(y);
                if (yd != null) history.add(yd);
            }

            Map<String, BigDecimal> industryMultiples = new HashMap<>();
            if (c.getIndustryPeRatio() != null)  industryMultiples.put("PE",  c.getIndustryPeRatio());
            if (c.getIndustryPbRatio() != null)  industryMultiples.put("PB",  c.getIndustryPbRatio());
            if (c.getIndustryPcfRatio() != null) industryMultiples.put("PCF", c.getIndustryPcfRatio());
            if (c.getIndustryPsRatio() != null)  industryMultiples.put("PS",  c.getIndustryPsRatio());

            try {
                valuationCalculator.calculateAllValuations(current, previous, history, industryMultiples);
            } catch (Exception ex) {
                logger.debug("Valuation failed for {} at year {}: {}", c.getStockId(), asOfYear, ex.getMessage());
            }
        }

        // --- Phase 4: keep only stocks with ≥2 usable TOPSIS criteria ---
        List<StockEntity> eligible = new ArrayList<>(clones.size());
        for (StockEntity c : clones) {
            if (usableCriteriaCount(c, asOfYear) >= 2) {
                eligible.add(c);
            }
        }

        logger.info("Snapshot year={} | universe={} cloned={} eligible={}",
                asOfYear, universe.size(), clones.size(), eligible.size());
        return new HistoricalSnapshot(asOfYear, eligible);
    }

    private static int usableCriteriaCount(StockEntity c, int asOfYear) {
        int n = 0;
        StockYearData yd = c.getYearData().get(asOfYear);
        if (yd == null) return 0;
        if (positive(yd.getDdm())) n++;
        if (positive(yd.getDcf())) n++;
        if (positive(yd.getRi())) n++;
        if (positive(c.getPeRatio())  && c.getIndustryPeRatio()  != null) n++;
        if (positive(c.getPbRatio())  && c.getIndustryPbRatio()  != null) n++;
        if (positive(c.getPcfRatio()) && c.getIndustryPcfRatio() != null) n++;
        if (positive(c.getPsRatio())  && c.getIndustryPsRatio()  != null) n++;
        return n;
    }

    private static boolean positive(BigDecimal v) {
        return v != null && v.compareTo(BigDecimal.ZERO) > 0;
    }
}
