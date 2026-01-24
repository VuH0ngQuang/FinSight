package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;
import com.finsight.marketrealtime.enums.RedisEnum;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.service.StockService;
import com.finsight.marketrealtime.service.StockYearDataService;
import com.finsight.marketrealtime.utils.LockManager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.locks.ReentrantLock;

@Service
public class StockYearDataServiceImpl implements StockYearDataService {
    private static final Logger logger = LoggerFactory.getLogger(StockYearDataServiceImpl.class);
    private final AppConf appConf;
    private final LockManager lockManager;
    private final StockRepository stockRepository;
    private final RedisDao redisDao;
    private final StockService stockService;

    @Autowired
    public StockYearDataServiceImpl(AppConf appConf,
                                    LockManager lockManager,
                                    StockRepository stockRepository,
                                    RedisDao redisDao,
                                    StockService stockService
                                    ) {
        this.appConf = appConf;
        this.lockManager = lockManager;
        this.stockRepository = stockRepository;
        this.redisDao = redisDao;
        this.stockService = stockService;
    }

    @Override
    @Transactional
    public ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId) {
        ReentrantLock lock = lockManager.getLock(stockId+year);
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findByIdWithYearData(stockId).orElse(null);
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

            stockService.recalculateValuations(stockEntity, year);
            stockRepository.save(stockEntity);
            redisDao.save(RedisEnum.STOCKYEARDATA.toString(), stockEntity.getStockId(), yearData);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    private void convertToDto(StockEntity.StockYearData yearData) {
        StockYearDataDto yearDataDto = new StockYearDataDto();
        yearDataDto.setNetIncome(yearData.getNetIncome());
        yearDataDto.setTotalEquity(yearData.getTotalEquity());
        yearDataDto.setIntangibles(yearData.getIntangibles());
        yearDataDto.setOperatingCashFlow(yearData.getOperatingCashFlow());
        yearDataDto.setFreeCashFlow(yearData.getFreeCashFlow());
        yearDataDto.setRevenue(yearData.getRevenue());
        yearDataDto.setDividendPerShare(yearData.getDividendPerShare());
        yearDataDto.setSharesOutstanding(yearData.getSharesOutstanding());
        yearDataDto.setPriceEndYear(yearData.getPriceEndYear());
        yearDataDto.setCostOfEquity(yearData.getCostOfEquity());
        yearDataDto.setWacc(yearData.getWacc());
        yearDataDto.setDividendGrowthRate(yearData.getDividendGrowthRate());
        yearDataDto.setDdm(yearData.getDdm());
        yearDataDto.setDcf(yearData.getDcf());
        yearDataDto.setRi(yearData.getRi());
        yearDataDto.setPe(yearData.getPe());
        yearDataDto.setPbv(yearData.getPbv());
        yearDataDto.setPcf(yearData.getPcf());
        yearDataDto.setPs(yearData.getPs());
    }
}
