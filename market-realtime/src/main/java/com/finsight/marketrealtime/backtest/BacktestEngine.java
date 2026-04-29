package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.dto.PortfolioAllocationResult;
import com.finsight.marketrealtime.dto.RankedStockDto;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.valuation.TopsisCalculator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The backtest replay loop. See {@link #run} for the algorithm.
 */
@Component
public class BacktestEngine {

    private static final Logger logger = LoggerFactory.getLogger(BacktestEngine.class);

    private final StockRepository stockRepository;
    private final SnapshotBuilder snapshotBuilder;
    private final TopsisCalculator topsisCalculator;
    private final PortfolioAllocator allocator;
    private final PerformanceMetrics metrics;
    private final BenchmarkLoader benchmarkLoader;

    public BacktestEngine(StockRepository stockRepository,
                          SnapshotBuilder snapshotBuilder,
                          TopsisCalculator topsisCalculator,
                          PortfolioAllocator allocator,
                          PerformanceMetrics metrics,
                          BenchmarkLoader benchmarkLoader) {
        this.stockRepository = stockRepository;
        this.snapshotBuilder = snapshotBuilder;
        this.topsisCalculator = topsisCalculator;
        this.allocator = allocator;
        this.metrics = metrics;
        this.benchmarkLoader = benchmarkLoader;
    }

    public List<StockEntity> loadUniverse() {
        return stockRepository.findAllWithYearData();
    }

    public BacktestResult run(BacktestConfig cfg) {
        return run(cfg, loadUniverse(), benchmarkLoader.load());
    }

    /**
     * Deterministic, pure variant used by tests.
     */
    public BacktestResult run(BacktestConfig cfg,
                              List<StockEntity> universe,
                              Map<Integer, BigDecimal> benchmarkSeries) {
        Map<String, StockEntity> universeById = new HashMap<>();
        for (StockEntity s : universe) universeById.put(s.getStockId(), s);

        PortfolioState pf = PortfolioState.cash(cfg.initialCapital(), universeById);
        EquityCurve curve = new EquityCurve();
        RebalanceLog log = new RebalanceLog();

        for (int t = cfg.startYear() + 1; t <= cfg.endYear(); t++) {
            int rebalanceYear = t - 1;

            // 1. Mark current holdings to market at rebalanceYear close, record point
            pf.markToMarket(rebalanceYear);
            curve.record(rebalanceYear, pf.totalValue());

            // 2. Point-in-time snapshot using only data observable by year-end rebalanceYear
            HistoricalSnapshot snap = snapshotBuilder.build(universe, rebalanceYear);
            if (snap.stocks().isEmpty()) {
                logger.warn("Empty snapshot at year {} — skipping rebalance, holding cash", rebalanceYear);
                // No selling/rebalancing; just record.
                continue;
            }

            // 3. Rank using AHP weights
            List<RankedStockDto> ranked = topsisCalculator.rank(snap.stocks(), cfg.weights());
            if (ranked.isEmpty()) {
                logger.warn("TOPSIS produced empty ranking at year {}", rebalanceYear);
                continue;
            }

            // 4. Liquidate prior positions at rebalanceYear close (tx cost on gross)
            BigDecimal proceeds = pf.liquidateAt(rebalanceYear, cfg.txCostBps());

            // 5. Rebalance into top-N using production allocation algorithm
            PortfolioAllocationResult alloc = allocator.allocate(
                    ranked, proceeds, cfg.topN(), cfg.lotSize());
            pf.applyAllocation(alloc, rebalanceYear, cfg.txCostBps());

            log.add(t, ranked, alloc);
        }

        // Final mark-to-market at endYear
        pf.markToMarket(cfg.endYear());
        curve.record(cfg.endYear(), pf.totalValue());

        BacktestMetrics m = metrics.compute(curve, benchmarkSeries);
        return new BacktestResult(curve, log, m, benchmarkSeries);
    }
}
