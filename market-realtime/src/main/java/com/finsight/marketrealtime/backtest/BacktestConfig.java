package com.finsight.marketrealtime.backtest;

import java.math.BigDecimal;
import java.nio.file.Path;

/**
 * Configuration for a single backtest run.
 *
 * @param startYear      inclusive start of the backtest window (first rebalance uses data ≤ startYear)
 * @param endYear        inclusive end of the backtest window (last mark-to-market)
 * @param topN           number of positions to hold after each rebalance
 * @param lotSize        exchange lot size (HOSE = 100)
 * @param initialCapital starting cash in VND
 * @param txCostBps      round-trip transaction cost in basis points (e.g. 15 = 0.15%)
 * @param weights        AHP weights, length must equal 7 (DDM, DCF, RI, PE, PB, PCF, PS)
 * @param outputDir      directory where CSV reports are written
 * @param mode           experiment mode: single | topn-sweep | weight-sensitivity | method-comparison | data-check
 */
public record BacktestConfig(
        int startYear,
        int endYear,
        int topN,
        int lotSize,
        BigDecimal initialCapital,
        int txCostBps,
        double[] weights,
        Path outputDir,
        String mode
) {
    public BacktestConfig withTopN(int n) {
        return new BacktestConfig(startYear, endYear, n, lotSize, initialCapital, txCostBps, weights, outputDir, mode);
    }

    public BacktestConfig withWeights(double[] w) {
        return new BacktestConfig(startYear, endYear, topN, lotSize, initialCapital, txCostBps, w, outputDir, mode);
    }
}
