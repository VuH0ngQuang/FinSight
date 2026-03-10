package com.finsight.marketrealtime.valuation;

import com.finsight.marketrealtime.dto.RankedStockDto;
import com.finsight.marketrealtime.model.StockEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution).
 *
 * All criteria are transformed to benefit-type before ranking:
 *   DDM, DCF, RI  → intrinsicValue / matchPrice  (higher = more undervalued)
 *   PE, PB, PCF, PS → industryRatio / stockRatio  (higher = cheaper vs peers)
 */
@Component
public class TopsisCalculator {
    private static final Logger logger = LoggerFactory.getLogger(TopsisCalculator.class);
    private static final int NUM_CRITERIA = 7;

    public List<RankedStockDto> rank(List<StockEntity> stocks, double[] ahpWeights) {
        if (stocks == null || stocks.isEmpty()) {
            return List.of();
        }
        if (ahpWeights == null || ahpWeights.length != NUM_CRITERIA) {
            throw new IllegalArgumentException(
                    "AHP weights must have exactly " + NUM_CRITERIA + " elements, got " +
                    (ahpWeights == null ? "null" : ahpWeights.length));
        }

        List<StockEntity> eligible = new ArrayList<>();
        List<double[]> rows = new ArrayList<>();

        for (StockEntity stock : stocks) {
            double[] row = buildCriteriaRow(stock);
            if (row != null) {
                eligible.add(stock);
                rows.add(row);
            }
        }

        if (eligible.isEmpty()) {
            logger.warn("No stocks have sufficient data for TOPSIS ranking");
            return List.of();
        }

        int m = eligible.size();
        double[][] matrix = rows.toArray(new double[m][]);

        vectorNormalize(matrix);
        applyWeights(matrix, ahpWeights);

        double[] idealBest = new double[NUM_CRITERIA];
        double[] idealWorst = new double[NUM_CRITERIA];
        Arrays.fill(idealBest, Double.NEGATIVE_INFINITY);
        Arrays.fill(idealWorst, Double.POSITIVE_INFINITY);

        for (double[] row : matrix) {
            for (int j = 0; j < NUM_CRITERIA; j++) {
                if (row[j] > idealBest[j]) idealBest[j] = row[j];
                if (row[j] < idealWorst[j]) idealWorst[j] = row[j];
            }
        }

        List<RankedStockDto> result = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            double distBest = euclidean(matrix[i], idealBest);
            double distWorst = euclidean(matrix[i], idealWorst);
            double closeness = (distBest + distWorst) == 0 ? 0 : distWorst / (distBest + distWorst);

            StockEntity s = eligible.get(i);
            result.add(RankedStockDto.builder()
                    .stockId(s.getStockId())
                    .stockName(s.getStockName())
                    .topsisScore(Math.round(closeness * 10000.0) / 10000.0)
                    .matchPrice(s.getMatchPrice())
                    .build());
        }

        result.sort(Comparator.comparingDouble(RankedStockDto::getTopsisScore).reversed());
        return result;
    }

    /**
     * Build a 7-element criteria vector for one stock.
     * Returns null if the stock lacks essential data (matchPrice, at least one valuation).
     *
     * Criteria order: DDM, DCF, RI, PE, PB, PCF, PS
     */
    private double[] buildCriteriaRow(StockEntity stock) {
        if (stock.getMatchPrice() == null || stock.getMatchPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal price = stock.getMatchPrice();
        Map<Integer, StockEntity.StockYearData> yearData = stock.getYearData();

        StockEntity.StockYearData latest = null;
        if (yearData != null && !yearData.isEmpty()) {
            int maxYear = yearData.keySet().stream().mapToInt(Integer::intValue).max().orElse(0);
            latest = yearData.get(maxYear);
        }

        double[] row = new double[NUM_CRITERIA];
        int populated = 0;

        // DDM: intrinsic / price  (benefit)
        if (latest != null && latest.getDdm() != null && latest.getDdm().compareTo(BigDecimal.ZERO) > 0) {
            row[0] = latest.getDdm().divide(price, 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        // DCF: intrinsic / price  (benefit)
        if (latest != null && latest.getDcf() != null && latest.getDcf().compareTo(BigDecimal.ZERO) > 0) {
            row[1] = latest.getDcf().divide(price, 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        // RI: intrinsic / price  (benefit)
        if (latest != null && latest.getRi() != null && latest.getRi().compareTo(BigDecimal.ZERO) > 0) {
            row[2] = latest.getRi().divide(price, 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        // PE: industryPE / stockPE  (benefit — lower PE vs industry = better)
        if (stock.getPeRatio() != null && stock.getPeRatio().compareTo(BigDecimal.ZERO) > 0
                && stock.getIndustryPeRatio() != null) {
            row[3] = stock.getIndustryPeRatio().divide(stock.getPeRatio(), 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        // PB
        if (stock.getPbRatio() != null && stock.getPbRatio().compareTo(BigDecimal.ZERO) > 0
                && stock.getIndustryPbRatio() != null) {
            row[4] = stock.getIndustryPbRatio().divide(stock.getPbRatio(), 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        // PCF
        if (stock.getPcfRatio() != null && stock.getPcfRatio().compareTo(BigDecimal.ZERO) > 0
                && stock.getIndustryPcfRatio() != null) {
            row[5] = stock.getIndustryPcfRatio().divide(stock.getPcfRatio(), 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        // PS
        if (stock.getPsRatio() != null && stock.getPsRatio().compareTo(BigDecimal.ZERO) > 0
                && stock.getIndustryPsRatio() != null) {
            row[6] = stock.getIndustryPsRatio().divide(stock.getPsRatio(), 6, RoundingMode.HALF_UP).doubleValue();
            populated++;
        }

        if (populated < 2) {
            logger.debug("Stock {} has only {} criteria populated, skipping", stock.getStockId(), populated);
            return null;
        }

        return row;
    }

    private void vectorNormalize(double[][] matrix) {
        int m = matrix.length;
        for (int j = 0; j < NUM_CRITERIA; j++) {
            double sumSq = 0;
            for (double[] row : matrix) {
                sumSq += row[j] * row[j];
            }
            double norm = Math.sqrt(sumSq);
            if (norm > 0) {
                for (int i = 0; i < m; i++) {
                    matrix[i][j] /= norm;
                }
            }
        }
    }

    private void applyWeights(double[][] matrix, double[] weights) {
        for (double[] row : matrix) {
            for (int j = 0; j < NUM_CRITERIA; j++) {
                row[j] *= weights[j];
            }
        }
    }

    private double euclidean(double[] a, double[] b) {
        double sum = 0;
        for (int i = 0; i < a.length; i++) {
            double diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}
