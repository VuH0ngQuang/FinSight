package com.finsight.marketrealtime.backtest;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Full output of a backtest: equity curve, rebalance log, metrics, and benchmark series.
 */
public record BacktestResult(
        EquityCurve equityCurve,
        RebalanceLog rebalanceLog,
        BacktestMetrics metrics,
        Map<Integer, BigDecimal> benchmarkSeries
) {
}
