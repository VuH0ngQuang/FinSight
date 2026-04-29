package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.model.StockEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Computes per-sector median PE / PB / PCF / PS from a cross-section of stocks
 * at a single point in time.
 *
 * Negative and null inputs are skipped (they would corrupt the median and are
 * typically data errors for healthy firms). A sector with no valid inputs for
 * a given ratio gets no entry in the returned map for that ratio.
 */
@Component
public class IndustryMedianCalculator {

    /**
     * @param stocks stocks with their stock-level peRatio/pbRatio/pcfRatio/psRatio
     *               already populated for the point in time of interest.
     * @return map of sector → { "PE" → median, "PB" → median, "PCF" → median, "PS" → median }.
     *         Missing entries mean no valid data for that (sector, ratio) pair.
     */
    public Map<String, Map<String, BigDecimal>> computeMediansBySector(List<StockEntity> stocks) {
        Map<String, List<BigDecimal>> pe = new HashMap<>();
        Map<String, List<BigDecimal>> pb = new HashMap<>();
        Map<String, List<BigDecimal>> pcf = new HashMap<>();
        Map<String, List<BigDecimal>> ps = new HashMap<>();

        for (StockEntity s : stocks) {
            String sector = s.getSector();
            if (sector == null || sector.isBlank()) continue;
            collect(pe, sector, s.getPeRatio());
            collect(pb, sector, s.getPbRatio());
            collect(pcf, sector, s.getPcfRatio());
            collect(ps, sector, s.getPsRatio());
        }

        Map<String, Map<String, BigDecimal>> out = new HashMap<>();
        addMedians(out, pe, "PE");
        addMedians(out, pb, "PB");
        addMedians(out, pcf, "PCF");
        addMedians(out, ps, "PS");
        return out;
    }

    private static void collect(Map<String, List<BigDecimal>> bucket, String sector, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) return;
        bucket.computeIfAbsent(sector, k -> new ArrayList<>()).add(value);
    }

    private static void addMedians(Map<String, Map<String, BigDecimal>> out,
                                   Map<String, List<BigDecimal>> bucket,
                                   String key) {
        for (Map.Entry<String, List<BigDecimal>> e : bucket.entrySet()) {
            BigDecimal m = median(e.getValue());
            if (m != null) {
                out.computeIfAbsent(e.getKey(), k -> new HashMap<>()).put(key, m);
            }
        }
    }

    static BigDecimal median(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) return null;
        List<BigDecimal> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int n = sorted.size();
        if (n % 2 == 1) {
            return sorted.get(n / 2);
        }
        BigDecimal a = sorted.get(n / 2 - 1);
        BigDecimal b = sorted.get(n / 2);
        return a.add(b).divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP);
    }
}
