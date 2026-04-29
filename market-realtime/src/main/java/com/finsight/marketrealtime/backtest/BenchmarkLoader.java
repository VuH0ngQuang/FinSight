package com.finsight.marketrealtime.backtest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Loads an annual benchmark series (e.g. VN-Index year-end close) from
 * {@code classpath:backtest/vnindex.csv}.
 *
 * Expected format: one header line, then {@code year,close} rows. Close may be
 * any positive decimal. Returns an empty map if the file is absent (the engine
 * still runs; metrics requiring a benchmark will be zeros).
 */
@Component
public class BenchmarkLoader {

    private static final Logger logger = LoggerFactory.getLogger(BenchmarkLoader.class);
    private static final String DEFAULT_PATH = "backtest/vnindex.csv";

    public Map<Integer, BigDecimal> load() {
        return load(DEFAULT_PATH);
    }

    public Map<Integer, BigDecimal> load(String classpathLocation) {
        Map<Integer, BigDecimal> out = new LinkedHashMap<>();
        ClassPathResource res = new ClassPathResource(classpathLocation);
        if (!res.exists()) {
            logger.warn("Benchmark CSV {} not found on classpath — benchmark metrics will be empty. "
                    + "Drop a file with `year,close` rows to enable VN-Index comparison.", classpathLocation);
            return out;
        }
        try (BufferedReader r = new BufferedReader(
                new InputStreamReader(res.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean first = true;
            while ((line = r.readLine()) != null) {
                if (line.isBlank()) continue;
                if (first) {
                    first = false;
                    if (line.toLowerCase().contains("year")) continue;
                }
                String[] parts = line.split(",");
                if (parts.length < 2) continue;
                try {
                    int year = Integer.parseInt(parts[0].trim());
                    BigDecimal close = new BigDecimal(parts[1].trim());
                    out.put(year, close);
                } catch (NumberFormatException nfe) {
                    logger.debug("Skipping malformed benchmark row: {}", line);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to read benchmark CSV {}", classpathLocation, e);
        }
        logger.info("Loaded {} benchmark data points from {}", out.size(), classpathLocation);
        return out;
    }
}
