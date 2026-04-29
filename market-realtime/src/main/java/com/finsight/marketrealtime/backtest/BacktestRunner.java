package com.finsight.marketrealtime.backtest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.dto.AhpConfigDto;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.service.AhpConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * CLI entry point: only instantiated under the `backtest` Spring profile.
 *
 * Parses {@code --key=value} args and dispatches to the appropriate experiment
 * mode. Always calls {@code System.exit} at the end so the runner doesn't
 * linger as a webserver.
 *
 * Supported modes:
 *   - data-check         Writes data_availability.csv (no trading sim)
 *   - single             Default — one full backtest + 4 CSVs
 *   - topn-sweep         Loops topN ∈ {5,10,15,20}
 *   - weight-sensitivity Dirichlet-perturbs AHP weights --runs times
 *   - method-comparison  AHP vs equal vs PE-only vs random
 */
@Component
@Profile("backtest")
public class BacktestRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(BacktestRunner.class);

    private final BacktestEngine engine;
    private final BacktestReporter reporter;
    private final AhpConfigService ahpConfigService;
    private final ObjectMapper objectMapper;
    private final ConfigurableApplicationContext context;

    public BacktestRunner(BacktestEngine engine,
                          BacktestReporter reporter,
                          AhpConfigService ahpConfigService,
                          ObjectMapper objectMapper,
                          ConfigurableApplicationContext context) {
        this.engine = engine;
        this.reporter = reporter;
        this.ahpConfigService = ahpConfigService;
        this.objectMapper = objectMapper;
        this.context = context;
    }

    @Override
    public void run(String... args) {
        int exitCode = 0;
        try {
            Map<String, String> a = parseArgs(args);
            String mode = a.getOrDefault("mode", "single");
            Path outRoot = Paths.get(a.getOrDefault("out", "market-realtime/backtest-out"));
            Path outDir = outRoot.resolve(mode).resolve(timestamp());
            logger.info("Backtest mode={} outDir={}", mode, outDir.toAbsolutePath());

            switch (mode) {
                case "data-check"         -> runDataCheck(outDir);
                case "single"             -> runSingle(a, outDir);
                case "topn-sweep"         -> runTopNSweep(a, outDir);
                case "weight-sensitivity" -> runWeightSensitivity(a, outDir);
                case "method-comparison"  -> runMethodComparison(a, outDir);
                default -> {
                    logger.error("Unknown mode: {}", mode);
                    exitCode = 2;
                }
            }
        } catch (Exception e) {
            logger.error("Backtest run failed", e);
            exitCode = 1;
        } finally {
            // Shut down Spring context so Maven spring-boot:run terminates cleanly.
            int code = exitCode;
            new Thread(() -> {
                try { Thread.sleep(200); } catch (InterruptedException ignored) {}
                int spring = org.springframework.boot.SpringApplication.exit(context, () -> code);
                System.exit(spring);
            }, "backtest-shutdown").start();
        }
    }

    // --- Modes -------------------------------------------------------------

    private void runDataCheck(Path outDir) throws Exception {
        List<StockEntity> universe = engine.loadUniverse();
        java.nio.file.Files.createDirectories(outDir);
        reporter.writeDataAvailability(outDir, universe);
    }

    private void runSingle(Map<String, String> a, Path outDir) throws Exception {
        BacktestConfig cfg = buildConfig(a, outDir, "single");
        BacktestResult result = engine.run(cfg);
        java.nio.file.Files.createDirectories(outDir);
        reporter.writeSingleRun(outDir, result);
        logSummary("single", result);
    }

    private void runTopNSweep(Map<String, String> a, Path outDir) throws Exception {
        java.nio.file.Files.createDirectories(outDir);
        int[] ns = {5, 10, 15, 20};
        Path out = outDir.resolve("topn_sweep.csv");
        try (CsvWriter w = new CsvWriter(out)) {
            w.writeHeader("topN", "CAGR_pct", "Sharpe", "MaxDrawdown_pct", "HitRate_pct", "Alpha_pct", "Beta");
            for (int n : ns) {
                BacktestConfig cfg = buildConfig(a, outDir, "topn-sweep").withTopN(n);
                BacktestResult r = engine.run(cfg);
                BacktestMetrics m = r.metrics();
                w.writeRow(n,
                        m.cagr() * 100,
                        m.sharpe(),
                        m.maxDrawdown() * 100,
                        m.hitRate() * 100,
                        m.alpha() * 100,
                        m.beta());
                logSummary("topN=" + n, r);
            }
        }
        logger.info("Wrote {}", out.toAbsolutePath());
    }

    private void runWeightSensitivity(Map<String, String> a, Path outDir) throws Exception {
        java.nio.file.Files.createDirectories(outDir);
        int runs = Integer.parseInt(a.getOrDefault("runs", "100"));
        double noise = Double.parseDouble(a.getOrDefault("noise", "0.2"));
        long seed = Long.parseLong(a.getOrDefault("seed", "42"));
        Random rng = new Random(seed);

        BacktestConfig base = buildConfig(a, outDir, "weight-sensitivity");
        BacktestResult baseResult = engine.run(base);
        List<String> baseTop = topTickersFromLastYear(baseResult);

        Path out = outDir.resolve("sensitivity_weights.csv");
        try (CsvWriter w = new CsvWriter(out)) {
            w.writeHeader("run", "CAGR_pct", "Sharpe", "MaxDrawdown_pct", "Top10_overlap_pct",
                    "w_DDM", "w_DCF", "w_RI", "w_PE", "w_PB", "w_PCF", "w_PS");
            // Row 0 = base
            w.writeRow(0,
                    baseResult.metrics().cagr() * 100,
                    baseResult.metrics().sharpe(),
                    baseResult.metrics().maxDrawdown() * 100,
                    100.0,
                    base.weights()[0], base.weights()[1], base.weights()[2], base.weights()[3],
                    base.weights()[4], base.weights()[5], base.weights()[6]);
            for (int i = 1; i <= runs; i++) {
                double[] w2 = perturbDirichlet(base.weights(), noise, rng);
                BacktestConfig cfg = base.withWeights(w2);
                BacktestResult r = engine.run(cfg);
                List<String> topI = topTickersFromLastYear(r);
                double overlap = overlapPct(baseTop, topI);
                w.writeRow(i,
                        r.metrics().cagr() * 100,
                        r.metrics().sharpe(),
                        r.metrics().maxDrawdown() * 100,
                        overlap,
                        w2[0], w2[1], w2[2], w2[3], w2[4], w2[5], w2[6]);
            }
        }
        logger.info("Wrote {}", out.toAbsolutePath());
    }

    private void runMethodComparison(Map<String, String> a, Path outDir) throws Exception {
        java.nio.file.Files.createDirectories(outDir);
        BacktestConfig base = buildConfig(a, outDir, "method-comparison");

        Map<String, double[]> methods = new HashMap<>();
        methods.put("AHP", base.weights());
        methods.put("EQUAL", new double[]{1.0/7, 1.0/7, 1.0/7, 1.0/7, 1.0/7, 1.0/7, 1.0/7});
        methods.put("PE_ONLY", new double[]{0, 0, 0, 1, 0, 0, 0});
        double[] rand = new double[7];
        Random r = new Random(7);
        double s = 0;
        for (int i = 0; i < 7; i++) { rand[i] = r.nextDouble() + 0.01; s += rand[i]; }
        for (int i = 0; i < 7; i++) rand[i] /= s;
        methods.put("RANDOM", rand);

        Path out = outDir.resolve("method_comparison.csv");
        try (CsvWriter w = new CsvWriter(out)) {
            w.writeHeader("method", "CAGR_pct", "Sharpe", "Sortino", "MaxDrawdown_pct",
                    "HitRate_pct", "Alpha_pct", "Beta");
            for (Map.Entry<String, double[]> e : methods.entrySet()) {
                BacktestConfig cfg = base.withWeights(e.getValue());
                BacktestResult res = engine.run(cfg);
                BacktestMetrics m = res.metrics();
                w.writeRow(e.getKey(),
                        m.cagr() * 100,
                        m.sharpe(),
                        m.sortino(),
                        m.maxDrawdown() * 100,
                        m.hitRate() * 100,
                        m.alpha() * 100,
                        m.beta());
                logSummary("method=" + e.getKey(), res);
            }
        }
        logger.info("Wrote {}", out.toAbsolutePath());
    }

    // --- Config building ---------------------------------------------------

    private BacktestConfig buildConfig(Map<String, String> a, Path outDir, String mode) {
        int start = Integer.parseInt(a.getOrDefault("start", "2019"));
        int end   = Integer.parseInt(a.getOrDefault("end", "2024"));
        int topN  = Integer.parseInt(a.getOrDefault("topN", "10"));
        int lot   = Integer.parseInt(a.getOrDefault("lotSize", "100"));
        BigDecimal cap = new BigDecimal(a.getOrDefault("capital", "1000000000"));
        int tx = Integer.parseInt(a.getOrDefault("txBps", "15"));
        double[] weights = resolveWeights(a);
        return new BacktestConfig(start, end, topN, lot, cap, tx, weights, outDir, mode);
    }

    private double[] resolveWeights(Map<String, String> a) {
        String explicit = a.get("weights");
        if (explicit != null && !explicit.isBlank()) {
            String[] parts = explicit.split(",");
            if (parts.length != 7) {
                throw new IllegalArgumentException("--weights must have 7 comma-separated values");
            }
            double[] w = new double[7];
            for (int i = 0; i < 7; i++) w[i] = Double.parseDouble(parts[i].trim());
            return normalize(w);
        }
        long userId = Long.parseLong(a.getOrDefault("userId", "144995632409477120"));
        try {
            AhpConfigDto cfg = ahpConfigService.getAhpConfigByUserId(userId);
            if (cfg != null && cfg.getWeightsJson() != null) {
                double[] w = objectMapper.readValue(cfg.getWeightsJson(), double[].class);
                if (w.length == 7) return w;
            }
        } catch (Exception e) {
            logger.warn("Could not resolve AHP weights for userId={}: {}", userId, e.getMessage());
        }
        logger.warn("Falling back to equal weights");
        return new double[]{1.0/7, 1.0/7, 1.0/7, 1.0/7, 1.0/7, 1.0/7, 1.0/7};
    }

    // --- Helpers -----------------------------------------------------------

    private static Map<String, String> parseArgs(String[] args) {
        Map<String, String> m = new HashMap<>();
        for (String s : args) {
            if (s == null || !s.startsWith("--")) continue;
            String body = s.substring(2);
            int eq = body.indexOf('=');
            if (eq > 0) m.put(body.substring(0, eq), body.substring(eq + 1));
            else        m.put(body, "true");
        }
        return m;
    }

    private static String timestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
    }

    private static double[] normalize(double[] w) {
        double s = 0;
        for (double v : w) s += v;
        if (s <= 0) return w;
        double[] out = new double[w.length];
        for (int i = 0; i < w.length; i++) out[i] = w[i] / s;
        return out;
    }

    private static double[] perturbDirichlet(double[] base, double noise, Random rng) {
        // Sample Dirichlet with concentration = base * (1/noise)
        double[] alpha = new double[base.length];
        double kappa = noise <= 0 ? 1e6 : 1.0 / noise;
        for (int i = 0; i < base.length; i++) alpha[i] = Math.max(1e-6, base[i] * kappa);
        double[] out = new double[base.length];
        double sum = 0;
        for (int i = 0; i < base.length; i++) {
            out[i] = gamma(alpha[i], rng);
            sum += out[i];
        }
        if (sum <= 0) return base;
        for (int i = 0; i < out.length; i++) out[i] /= sum;
        return out;
    }

    // Marsaglia-Tsang Gamma sampler; adequate for sensitivity analysis.
    private static double gamma(double shape, Random rng) {
        if (shape < 1) {
            return gamma(shape + 1, rng) * Math.pow(rng.nextDouble(), 1.0 / shape);
        }
        double d = shape - 1.0 / 3.0;
        double c = 1.0 / Math.sqrt(9 * d);
        while (true) {
            double x = rng.nextGaussian();
            double v = 1 + c * x;
            if (v <= 0) continue;
            v = v * v * v;
            double u = rng.nextDouble();
            if (u < 1 - 0.0331 * x * x * x * x) return d * v;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
        }
    }

    private static List<String> topTickersFromLastYear(BacktestResult r) {
        List<RebalanceLog.Entry> es = r.rebalanceLog().entries();
        if (es.isEmpty()) return List.of();
        List<String> out = new ArrayList<>();
        int limit = Math.min(10, es.get(es.size() - 1).topRanked().size());
        for (int i = 0; i < limit; i++) out.add(es.get(es.size() - 1).topRanked().get(i).getStockId());
        return out;
    }

    private static double overlapPct(List<String> a, List<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0;
        int n = 0;
        for (String s : a) if (b.contains(s)) n++;
        return 100.0 * n / a.size();
    }

    private static void logSummary(String label, BacktestResult r) {
        BacktestMetrics m = r.metrics();
        logger.info("[{}] CAGR={}% Sharpe={} MDD={}% HitRate={}% Alpha={}% Beta={}",
                label,
                String.format("%.2f", m.cagr() * 100),
                String.format("%.2f", m.sharpe()),
                String.format("%.2f", m.maxDrawdown() * 100),
                String.format("%.2f", m.hitRate() * 100),
                String.format("%.2f", m.alpha() * 100),
                String.format("%.2f", m.beta()));
    }
}
