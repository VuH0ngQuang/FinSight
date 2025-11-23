package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.StockEntity.StockYearData;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.service.StockService;
import com.finsight.marketrealtime.utils.LockManager;
import com.finsight.marketrealtime.valuation.StockValuationCalculator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service
public class StockServiceImpl implements StockService {
    private static final Logger logger = LoggerFactory.getLogger(StockServiceImpl.class);
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final LockManager<String> lockManager;
    private final StockValuationCalculator stockValuationCalculator;

    @Autowired
    public StockServiceImpl(
            StockRepository stockRepository,
            UserRepository userRepository,
            LockManager<String> lockManager,
            StockValuationCalculator stockValuationCalculator) {
        this.stockRepository = stockRepository;
        this.userRepository = userRepository;
        this.lockManager = lockManager;
        this.stockValuationCalculator = stockValuationCalculator;
    }

    @Override
    public ResponseDto createStock(StockDto stockDto) {
        StockEntity stockEntity = StockEntity.builder().stockId(stockDto.getStockId()).build();
        ReentrantLock lock = lockManager.getLock(stockEntity.getStockId());
        lock.lock();
        try {
            stockEntity.setStockId(stockDto.getStockId());
            stockEntity.setStockName(stockDto.getStockName());
            stockRepository.save(stockEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto updateStock(StockDto stockDto) {
        ReentrantLock lock = lockManager.getLock(stockDto.getStockId());
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findById(stockDto.getStockId()).orElse(null);
            if (stockEntity == null) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("Stock not found").
                    build();

            stockEntity.setStockName(stockDto.getStockName());
            stockEntity.setSector(stockDto.getSector());
            stockRepository.save(stockEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto deleteStock(StockDto stockDto) {
        ReentrantLock lock = lockManager.getLock(stockDto.getStockId());
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findById(stockDto.getStockId()).orElse(null);
            if (stockEntity == null) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("Stock not found").
                    build();

            stockEntity.getFavoredByUsers().
                    forEach(user -> user.getFavoriteStocks().remove(stockEntity));
            stockEntity.getFavoredByUsers().clear();

            stockRepository.delete(stockEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto,int year, String stockId) {
        ReentrantLock lock = lockManager.getLock(stockId+year);
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findById(stockId).orElse(null);
            if (stockEntity == null) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("Stock not found: "+stockId).
                    build();
            StockEntity.StockYearData yearData = stockEntity.getYearData()
                    .computeIfAbsent(year, y -> new StockEntity.StockYearData());

            if (stockYearDataDto.getNetIncome() != null)
                yearData.setNetIncome(stockYearDataDto.getNetIncome());
            if (stockYearDataDto.getTotalEquity() != null)
                yearData.setTotalEquity(stockYearDataDto.getTotalEquity());
            if (stockYearDataDto.getIntangibles() != null)
                yearData.setIntangibles(stockYearDataDto.getIntangibles());
            if (stockYearDataDto.getOperatingCashFlow() != null)
                yearData.setOperatingCashFlow(stockYearDataDto.getOperatingCashFlow());
            if (stockYearDataDto.getFreeCashFlow() != null)
                yearData.setFreeCashFlow(stockYearDataDto.getFreeCashFlow());
            if (stockYearDataDto.getRevenue() != null)
                yearData.setRevenue(stockYearDataDto.getRevenue());
            if (stockYearDataDto.getDividendPerShare() != null)
                yearData.setDividendPerShare(stockYearDataDto.getDividendPerShare());
            if (stockYearDataDto.getSharesOutstanding() != null)
                yearData.setSharesOutstanding(stockYearDataDto.getSharesOutstanding());
            if (stockYearDataDto.getPriceEndYear() != null)
                yearData.setPriceEndYear(stockYearDataDto.getPriceEndYear());
            if (stockYearDataDto.getCostOfEquity() != null)
                yearData.setCostOfEquity(stockYearDataDto.getCostOfEquity());
            if (stockYearDataDto.getWacc() != null)
                yearData.setWacc(stockYearDataDto.getWacc());
            if (stockYearDataDto.getDividendGrowthRate() != null)
                yearData.setDividendGrowthRate(stockYearDataDto.getDividendGrowthRate());

            recalculateValuations(stockEntity, year);
            stockRepository.save(stockEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    public ResponseDto updateIndustryRatios(StockDto stockDto) {
        List<StockEntity> stocksInSector = stockRepository.findBySector(stockDto.getSector());
        for (StockEntity stock : stocksInSector) {
            ReentrantLock lock = lockManager.getLock(stock.getStockId());
            lock.lock();
            try {
                if (stockDto.getIndustryPeRatio() != null) stock.setIndustryPeRatio(stockDto.getIndustryPeRatio());
                if (stockDto.getIndustryPbRatio() != null) stock.setIndustryPbRatio(stockDto.getIndustryPbRatio());
                if (stockDto.getIndustryPcfRatio() != null) stock.setIndustryPcfRatio(stockDto.getIndustryPcfRatio());
                if (stockDto.getIndustryPsRatio() != null) stock.setIndustryPsRatio(stockDto.getIndustryPsRatio());

                stockRepository.save(stock);
            } finally {
                lock.unlock();
            }
        }
        return ResponseDto.builder().success(true).build();
    }

    public void updateMatchPrice(String stockId, BigDecimal matchPrice) {
        ReentrantLock lock = lockManager.getLock(stockId);
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findById(stockId).orElse(null);
            if (stockEntity == null) {
                logger.error("Cannot find stock to update match price: {}", stockId);
                return;
            }

            // update price first
            stockEntity.setMatchPrice(matchPrice);

            // get latest fundamental year data
            StockEntity.StockYearData latestYearData = stockRepository.findLatestYearDataByStockId(stockId);
            if (latestYearData == null) {
                logger.error("No year data found for stock {} to recalculate valuations", stockId);
                stockRepository.save(stockEntity); // at least persist the new price
                return;
            }

            BigDecimal price  = stockEntity.getMatchPrice();
            BigDecimal shares = BigDecimal.valueOf(latestYearData.getSharesOutstanding());

            // PE
            try {
                stockEntity.setPeRatio(
                        price.divide(
                                latestYearData.getNetIncome()
                                        .divide(shares, 4, RoundingMode.HALF_UP),
                                4,
                                RoundingMode.HALF_UP
                        )
                );
            } catch (Exception e) {
                logger.warn("Failed to recalc PE for stock {}", stockId, e);
                stockEntity.setPeRatio(null);
            }

            // PB
            try {
                stockEntity.setPbRatio(
                        price.divide(
                                latestYearData.getTotalEquity()
                                        .subtract(latestYearData.getIntangibles())
                                        .divide(shares, 4, RoundingMode.HALF_UP),
                                4,
                                RoundingMode.HALF_UP
                        )
                );
            } catch (Exception e) {
                logger.warn("Failed to recalc PB for stock {}", stockId, e);
                stockEntity.setPbRatio(null);
            }

            // PCF
            try {
                stockEntity.setPcfRatio(
                        price.divide(
                                latestYearData.getOperatingCashFlow()
                                        .divide(shares, 4, RoundingMode.HALF_UP),
                                4,
                                RoundingMode.HALF_UP
                        )
                );
            } catch (Exception e) {
                logger.warn("Failed to recalc PCF for stock {}", stockId, e);
                stockEntity.setPcfRatio(null);
            }

            // PS
            try {
                stockEntity.setPsRatio(
                        price.divide(
                                latestYearData.getRevenue()
                                        .divide(shares, 4, RoundingMode.HALF_UP),
                                4,
                                RoundingMode.HALF_UP
                        )
                );
            } catch (Exception e) {
                logger.warn("Failed to recalc PS for stock {}", stockId, e);
                stockEntity.setPsRatio(null);
            }

            // Single DB write at the end
            stockRepository.save(stockEntity);

        } finally {
            lock.unlock();
        }
    }


    private void recalculateValuations(StockEntity stockEntity, int targetYear) {
        StockYearData currentData = stockEntity.getYearData().get(targetYear);
        if (currentData == null) {
            return;
        }

        if (!hasMinimumRequiredFields(currentData)) {
            logger.warn("Insufficient data for valuation calculation for stock {} year {}",
                    stockEntity.getStockId(), targetYear);
            return;
        }

        Map<Integer, StockYearData> yearDataMap = stockEntity.getYearData();
        List<StockYearData> historicalData = yearDataMap.entrySet().stream()
                .filter(entry -> entry.getKey() < targetYear)
                .sorted(Map.Entry.comparingByKey())
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());

        StockYearData previousData = historicalData.isEmpty() ? null : historicalData.get(historicalData.size() - 1);

        stockValuationCalculator.calculateAllValuations(
                currentData,
                previousData,
                historicalData,
                buildIndustryMultiples(stockEntity)
        );
    }

    private boolean hasMinimumRequiredFields(StockYearData data) {
        Long sharesOutstanding = data.getSharesOutstanding();
        return sharesOutstanding != null && sharesOutstanding > 0;
    }

    private Map<String, BigDecimal> buildIndustryMultiples(StockEntity stockEntity) {
        Map<String, BigDecimal> multiples = new HashMap<>();
        
        // Try to use industry averages first
        if (stockEntity.getIndustryPeRatio() != null) {
            multiples.put("PE", stockEntity.getIndustryPeRatio());
        }
        if (stockEntity.getIndustryPbRatio() != null) {
            multiples.put("PB", stockEntity.getIndustryPbRatio());
        }
        if (stockEntity.getIndustryPcfRatio() != null) {
            multiples.put("PCF", stockEntity.getIndustryPcfRatio());
        }
        if (stockEntity.getIndustryPsRatio() != null) {
            multiples.put("PS", stockEntity.getIndustryPsRatio());
        }
    
        // Fill in missing multiples with defaults
        Map<String, BigDecimal> defaults = getDefaultMultiples();
        for (String key : defaults.keySet()) {
            if (!multiples.containsKey(key)) {
                multiples.put(key, defaults.get(key));
                logger.debug("Using default {} ratio for stock {}: {}", 
                            key, stockEntity.getStockId(), defaults.get(key));
            }
        }
        
        if (multiples.size() < defaults.size()) {
            logger.warn("Some industry multiples missing for stock {}, using partial defaults", 
                       stockEntity.getStockId());
        }
    
        return multiples;
    }

    private Map<String, BigDecimal> getDefaultMultiples() {
        Map<String, BigDecimal> defaults = new HashMap<>();
        defaults.put("PE", new BigDecimal("15.0"));
        defaults.put("PB", new BigDecimal("2.0"));
        defaults.put("PCF", new BigDecimal("12.0"));
        defaults.put("PS", new BigDecimal("1.5"));
        return defaults;
    }
}
