package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.dto.RankedStockDto;
import com.finsight.marketrealtime.dto.StockAllocationDto;
import com.finsight.marketrealtime.model.StockEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Writes the five thesis-ready CSVs to a timestamped output folder.
 */
@Component
public class BacktestReporter {

    private static final Logger logger = LoggerFactory.getLogger(BacktestReporter.class);

    public void writeSingleRun(Path outDir, BacktestResult result) throws IOException {
        writeEquityCurve(outDir.resolve("equity_curve.csv"), result);
        writeDrawdown(outDir.resolve("drawdown.csv"), result);
        writeRebalanceLog(outDir.resolve("rebalance_log.csv"), result);
        writeMetrics(outDir.resolve("metrics.csv"), result.metrics());
        logger.info("Wrote single-run CSVs to {}", outDir.toAbsolutePath());
    }

    public void writeDataAvailability(Path outDir, List<StockEntity> universe) throws IOException {
        Path f = outDir.resolve("data_availability.csv");
        try (CsvWriter w = new CsvWriter(f)) {
            w.writeHeader("stock_id", "sector", "years_available", "years_with_price", "min_year", "max_year");
            for (StockEntity s : universe) {
                Map<Integer, StockEntity.StockYearData> yd = s.getYearData();
                int total = yd == null ? 0 : yd.size();
                int withPx = 0;
                int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
                if (yd != null) {
                    for (Map.Entry<Integer, StockEntity.StockYearData> e : yd.entrySet()) {
                        if (e.getValue() != null && e.getValue().getPriceEndYear() != null
                                && e.getValue().getPriceEndYear().compareTo(BigDecimal.ZERO) > 0) {
                            withPx++;
                        }
                        if (e.getKey() < min) min = e.getKey();
                        if (e.getKey() > max) max = e.getKey();
                    }
                }
                w.writeRow(
                        s.getStockId(),
                        s.getSector() == null ? "" : s.getSector(),
                        total,
                        withPx,
                        min == Integer.MAX_VALUE ? "" : min,
                        max == Integer.MIN_VALUE ? "" : max);
            }
        }
        logger.info("Wrote {}", f.toAbsolutePath());
    }

    private void writeEquityCurve(Path f, BacktestResult r) throws IOException {
        Map<Integer, BigDecimal> bench = r.benchmarkSeries();
        try (CsvWriter w = new CsvWriter(f)) {
            w.writeHeader("year", "portfolio_value", "vnindex_value", "port_return_pct", "vn_return_pct");
            BigDecimal prevPort = null;
            BigDecimal prevBench = null;
            for (EquityCurve.Point p : r.equityCurve().points()) {
                BigDecimal b = bench == null ? null : bench.get(p.year());
                String portRet = prevPort == null || prevPort.signum() == 0 ? "" :
                        pct(p.portfolioValue().divide(prevPort, 8, RoundingMode.HALF_UP).subtract(BigDecimal.ONE));
                String benchRet = (prevBench == null || b == null || prevBench.signum() == 0) ? "" :
                        pct(b.divide(prevBench, 8, RoundingMode.HALF_UP).subtract(BigDecimal.ONE));
                w.writeRow(p.year(), p.portfolioValue(), b == null ? "" : b, portRet, benchRet);
                prevPort = p.portfolioValue();
                if (b != null) prevBench = b;
            }
        }
    }

    private void writeDrawdown(Path f, BacktestResult r) throws IOException {
        try (CsvWriter w = new CsvWriter(f)) {
            w.writeHeader("year", "port_drawdown_pct", "vn_drawdown_pct");
            Set<Integer> years = new java.util.TreeSet<>();
            years.addAll(r.metrics().drawdownSeries().keySet());
            years.addAll(r.metrics().benchmarkDrawdownSeries().keySet());
            for (Integer y : years) {
                Double pd = r.metrics().drawdownSeries().get(y);
                Double bd = r.metrics().benchmarkDrawdownSeries().get(y);
                w.writeRow(y,
                        pd == null ? "" : pctD(pd),
                        bd == null ? "" : pctD(bd));
            }
        }
    }

    private void writeRebalanceLog(Path f, BacktestResult r) throws IOException {
        try (CsvWriter w = new CsvWriter(f)) {
            w.writeHeader("year", "ticker", "action", "shares", "price_vnd", "topsis_score", "weight_pct");
            for (RebalanceLog.Entry entry : r.rebalanceLog().entries()) {
                Set<String> held = new HashSet<>();
                if (entry.allocation() != null && entry.allocation().getAllocations() != null) {
                    for (StockAllocationDto a : entry.allocation().getAllocations()) {
                        w.writeRow(entry.year(), a.getStockId(), "BUY", a.getShares(),
                                a.getPricePerShare(), a.getTopsisScore(), a.getAllocationPercentage());
                        held.add(a.getStockId());
                    }
                }
                int limit = Math.min(10, entry.topRanked().size());
                for (int i = 0; i < limit; i++) {
                    RankedStockDto rs = entry.topRanked().get(i);
                    if (held.contains(rs.getStockId())) continue;
                    w.writeRow(entry.year(), rs.getStockId(), "RANK", "", rs.getMatchPrice(), rs.getTopsisScore(), "");
                }
            }
        }
    }

    private void writeMetrics(Path f, BacktestMetrics m) throws IOException {
        try (CsvWriter w = new CsvWriter(f)) {
            w.writeHeader("metric", "portfolio", "vnindex");
            w.writeRow("CAGR", pctD(m.cagr()), pctD(m.benchmarkCagr()));
            w.writeRow("Volatility", pctD(m.annualizedVolatility()), pctD(m.benchmarkVolatility()));
            w.writeRow("Sharpe", round4(m.sharpe()), round4(m.benchmarkSharpe()));
            w.writeRow("Sortino", round4(m.sortino()), "");
            w.writeRow("MaxDrawdown", pctD(m.maxDrawdown()), pctD(m.benchmarkMaxDrawdown()));
            w.writeRow("HitRate", pctD(m.hitRate()), "");
            w.writeRow("Alpha", pctD(m.alpha()), "");
            w.writeRow("Beta", round4(m.beta()), "");
        }
    }

    private static String pct(BigDecimal v) {
        return v.multiply(BigDecimal.valueOf(100)).setScale(4, RoundingMode.HALF_UP).toPlainString();
    }

    private static String pctD(double v) {
        return BigDecimal.valueOf(v * 100).setScale(4, RoundingMode.HALF_UP).toPlainString();
    }

    private static String round4(double v) {
        return BigDecimal.valueOf(v).setScale(4, RoundingMode.HALF_UP).toPlainString();
    }
}
