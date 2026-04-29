package com.finsight.marketrealtime.backtest;

import java.util.Map;

/**
 * Aggregated performance metrics for a single backtest run.
 *
 * Percent fields (cagr, sharpe, sortino, maxDrawdown, alpha, beta, hitRate) are
 * plain decimals (e.g. 0.12 = 12%). MDD is reported as a negative number.
 */
public record BacktestMetrics(
        double cagr,
        double annualizedVolatility,
        double sharpe,
        double sortino,
        double maxDrawdown,
        double hitRate,
        double alpha,
        double beta,
        double benchmarkCagr,
        double benchmarkVolatility,
        double benchmarkSharpe,
        double benchmarkMaxDrawdown,
        Map<Integer, Double> drawdownSeries,
        Map<Integer, Double> benchmarkDrawdownSeries
) {
}
