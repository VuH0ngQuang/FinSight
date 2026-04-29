package com.finsight.marketrealtime.backtest;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Manual statistics — no external math dependency.
 *
 * Conventions:
 *   - Returns are simple annual returns: r_t = V_t / V_{t-1} - 1.
 *   - Risk-free rate is assumed zero (thesis simplification; document in §4.3).
 *   - Alpha and beta come from a simple OLS regression of portfolio excess returns
 *     on benchmark excess returns.
 *   - Hit rate = fraction of years where portfolio return ≥ benchmark return.
 */
@Component
public class PerformanceMetrics {

    public BacktestMetrics compute(EquityCurve curve, Map<Integer, BigDecimal> benchmarkSeries) {
        List<double[]> aligned = alignSeries(curve, benchmarkSeries);
        double[] portReturns = annualReturns(aligned, 0);
        double[] benchReturns = annualReturns(aligned, 1);

        double cagr = cagr(aligned, 0);
        double benchCagr = cagr(aligned, 1);

        double portVol = stdev(portReturns);
        double benchVol = stdev(benchReturns);

        double sharpe = portVol > 0 ? mean(portReturns) / portVol : 0;
        double benchSharpe = benchVol > 0 ? mean(benchReturns) / benchVol : 0;

        double sortino = sortino(portReturns);

        Map<Integer, Double> portDd = drawdownSeries(aligned, 0);
        Map<Integer, Double> benchDd = drawdownSeries(aligned, 1);

        double portMdd = portDd.values().stream().mapToDouble(Double::doubleValue).min().orElse(0);
        double benchMdd = benchDd.values().stream().mapToDouble(Double::doubleValue).min().orElse(0);

        double hit = hitRate(portReturns, benchReturns);

        double[] ab = regressAlphaBeta(portReturns, benchReturns);

        return new BacktestMetrics(
                cagr, portVol, sharpe, sortino, portMdd, hit, ab[0], ab[1],
                benchCagr, benchVol, benchSharpe, benchMdd,
                portDd, benchDd);
    }

    /**
     * @return rows of [portfolioValue, benchmarkValue] ordered by year; rows with
     *         a missing benchmark value are dropped (can't compare that year).
     */
    static List<double[]> alignSeries(EquityCurve curve, Map<Integer, BigDecimal> benchmark) {
        List<double[]> out = new ArrayList<>();
        for (EquityCurve.Point p : curve.points()) {
            BigDecimal b = benchmark == null ? null : benchmark.get(p.year());
            if (b == null) continue;
            out.add(new double[]{p.portfolioValue().doubleValue(), b.doubleValue(), p.year()});
        }
        return out;
    }

    static double[] annualReturns(List<double[]> aligned, int col) {
        if (aligned.size() < 2) return new double[0];
        double[] r = new double[aligned.size() - 1];
        for (int i = 1; i < aligned.size(); i++) {
            double prev = aligned.get(i - 1)[col];
            double curr = aligned.get(i)[col];
            r[i - 1] = prev > 0 ? (curr / prev) - 1 : 0;
        }
        return r;
    }

    static double cagr(List<double[]> aligned, int col) {
        if (aligned.size() < 2) return 0;
        double first = aligned.get(0)[col];
        double last = aligned.get(aligned.size() - 1)[col];
        if (first <= 0 || last <= 0) return 0;
        double years = aligned.size() - 1;
        return Math.pow(last / first, 1.0 / years) - 1;
    }

    static Map<Integer, Double> drawdownSeries(List<double[]> aligned, int col) {
        Map<Integer, Double> out = new LinkedHashMap<>();
        double peak = Double.NEGATIVE_INFINITY;
        for (double[] row : aligned) {
            double v = row[col];
            int year = (int) row[2];
            if (v > peak) peak = v;
            double dd = peak > 0 ? (v / peak) - 1 : 0; // ≤ 0
            out.put(year, dd);
        }
        return out;
    }

    static double mean(double[] r) {
        if (r.length == 0) return 0;
        double s = 0;
        for (double v : r) s += v;
        return s / r.length;
    }

    static double stdev(double[] r) {
        if (r.length < 2) return 0;
        double m = mean(r);
        double ss = 0;
        for (double v : r) ss += (v - m) * (v - m);
        return Math.sqrt(ss / (r.length - 1));
    }

    static double sortino(double[] r) {
        if (r.length < 2) return 0;
        double ss = 0;
        int n = 0;
        for (double v : r) {
            if (v < 0) { ss += v * v; n++; }
        }
        if (n == 0) return 0;
        double downside = Math.sqrt(ss / n);
        return downside > 0 ? mean(r) / downside : 0;
    }

    static double hitRate(double[] port, double[] bench) {
        if (port.length == 0 || port.length != bench.length) return 0;
        int wins = 0;
        for (int i = 0; i < port.length; i++) {
            if (port[i] >= bench[i]) wins++;
        }
        return (double) wins / port.length;
    }

    /**
     * OLS: port_r = alpha + beta * bench_r + e
     * @return {alpha, beta}; both zero if fewer than 2 observations or zero variance.
     */
    static double[] regressAlphaBeta(double[] port, double[] bench) {
        if (port.length < 2 || port.length != bench.length) return new double[]{0, 0};
        double mp = mean(port);
        double mb = mean(bench);
        double num = 0, den = 0;
        for (int i = 0; i < port.length; i++) {
            num += (bench[i] - mb) * (port[i] - mp);
            den += (bench[i] - mb) * (bench[i] - mb);
        }
        double beta = den > 0 ? num / den : 0;
        double alpha = mp - beta * mb;
        return new double[]{alpha, beta};
    }

    @SuppressWarnings("unused")
    private static BigDecimal round(double v) {
        return BigDecimal.valueOf(v).setScale(6, RoundingMode.HALF_UP);
    }
}
