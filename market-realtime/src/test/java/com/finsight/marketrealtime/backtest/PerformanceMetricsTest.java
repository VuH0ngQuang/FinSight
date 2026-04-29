package com.finsight.marketrealtime.backtest;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PerformanceMetricsTest {

    private final PerformanceMetrics m = new PerformanceMetrics();

    @Test
    void cagrAndDrawdownOnConstantGrowth() {
        EquityCurve curve = new EquityCurve();
        curve.record(2020, new BigDecimal("100"));
        curve.record(2021, new BigDecimal("110"));
        curve.record(2022, new BigDecimal("121"));
        curve.record(2023, new BigDecimal("133.1"));

        Map<Integer, BigDecimal> bench = new LinkedHashMap<>();
        bench.put(2020, new BigDecimal("1000"));
        bench.put(2021, new BigDecimal("1050"));
        bench.put(2022, new BigDecimal("1102.5"));
        bench.put(2023, new BigDecimal("1157.625"));

        BacktestMetrics out = m.compute(curve, bench);
        assertEquals(0.10, out.cagr(), 1e-6);
        assertEquals(0.05, out.benchmarkCagr(), 1e-6);
        // Zero drawdown on monotonically increasing series
        assertEquals(0.0, out.maxDrawdown(), 1e-9);
        // Port beats bench every year
        assertEquals(1.0, out.hitRate(), 1e-9);
    }

    @Test
    void drawdownCapturedOnDip() {
        EquityCurve curve = new EquityCurve();
        curve.record(2020, new BigDecimal("100"));
        curve.record(2021, new BigDecimal("120"));
        curve.record(2022, new BigDecimal("60")); // -50% from peak
        curve.record(2023, new BigDecimal("90"));

        Map<Integer, BigDecimal> bench = new LinkedHashMap<>();
        bench.put(2020, new BigDecimal("100"));
        bench.put(2021, new BigDecimal("100"));
        bench.put(2022, new BigDecimal("100"));
        bench.put(2023, new BigDecimal("100"));

        BacktestMetrics out = m.compute(curve, bench);
        assertEquals(-0.5, out.maxDrawdown(), 1e-9);
    }

    @Test
    void handlesSinglePointGracefully() {
        EquityCurve curve = new EquityCurve();
        curve.record(2020, new BigDecimal("100"));
        Map<Integer, BigDecimal> bench = Map.of(2020, new BigDecimal("100"));
        BacktestMetrics out = m.compute(curve, bench);
        assertEquals(0.0, out.cagr());
        assertEquals(0.0, out.sharpe());
    }
}
