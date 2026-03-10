package com.finsight.marketrealtime.valuation;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.kafka.common.protocol.types.Field.Bool;
import org.springframework.stereotype.Component;

import com.finsight.marketrealtime.model.StockEntity;

import static org.apache.coyote.http11.Constants.a;

@Component
public class OvervaluationDetector {
    private static final double THRESHOLD = 0.5;

    public OvervaluationResult evaluate(StockEntity stock, StockEntity.StockYearData latestYearData) {
        Map<String, Boolean> results = new LinkedHashMap<>();

        BigDecimal priceInUnits = stock.getMatchPrice().multiply(BigDecimal.valueOf(1000));

        // 1. Relative PE
        results.put("Relative PE", isGreater(stock.getPeRatio(), stock.getIndustryPeRatio()));
        // 2. Relative PB
        results.put("Relative PB", isGreater(stock.getPbRatio(), stock.getIndustryPbRatio()));
        // 3. Relative PCF
        results.put("Relative PCF", isGreater(stock.getPcfRatio(), stock.getIndustryPcfRatio()));
        // 4. Relative PS
        results.put("Relative PS", isGreater(stock.getPsRatio(), stock.getIndustryPsRatio()));
        // 5. PEG
        results.put("PEG", evaluatePEG(stock.getPeRatio(), latestYearData.getDividendGrowthRate()));
        // 6. DDM
        results.put("DDM", isGreater(priceInUnits, latestYearData.getDdm()));
        // 7. DCF
        results.put("DCF", isGreater(priceInUnits, latestYearData.getDcf()));
        // 8. RI
        results.put("RI", isGreater(priceInUnits, latestYearData.getRi()));

        long total = results.values().stream().filter(v -> v != null).count();
        long overcount = results.values().stream().filter(v -> Boolean.TRUE.equals(v)).count();
        double percent = total > 0 ? (double) overcount / total * 100 : 0;

        return OvervaluationResult.builder().
                stockId(stock.getStockId()).
                stockName(stock.getStockName()).
                totalIndicators((int) total).
                overvaluedCount((int) overcount).
                overvaluePercent(percent).
                overvalued(percent >= THRESHOLD * 100).
                indicatorResults(results).
                build();
    }

    private Boolean isGreater(BigDecimal value, BigDecimal target) {
        if (value == null || target == null) return null;
        return value.compareTo(target) > 0;
    }

    private Boolean evaluatePEG(BigDecimal peRatio, BigDecimal dividendGrowthRate) {
        if (peRatio == null || dividendGrowthRate == null
                || dividendGrowthRate.compareTo(BigDecimal.ZERO) <= 0) return null;
        BigDecimal peg = peRatio.divide(
                dividendGrowthRate.multiply(BigDecimal.valueOf(100)), 4, RoundingMode.HALF_UP);
        return peg.compareTo(BigDecimal.ONE) > 0;
    }
}