package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockYearDataHistoryRequestDto;
import com.finsight.marketrealtime.dto.StockYearDataHistoryResponseDto;
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

import java.util.ArrayList;
import java.util.List;
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
    public ResponseDto createStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId) {
        ReentrantLock lock = lockManager.getLock(stockId + year);
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findByIdWithYearData(stockId).orElse(null);
            if (stockEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Stock not found: " + stockId)
                        .build();
            }

            if (stockEntity.getYearData().containsKey(year)) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(409)
                        .errorMessage("Year data already exists for stock " + stockId + " year " + year)
                        .build();
            }

            StockEntity.StockYearData yearData = new StockEntity.StockYearData();
            applyDtoToYearData(stockYearDataDto, yearData);
            stockEntity.getYearData().put(year, yearData);

            stockService.recalculateValuations(stockEntity, year);
            stockRepository.save(stockEntity);
            String cacheField = stockEntity.getStockId() + ":" + year;
            redisDao.save(RedisEnum.STOCKYEARDATA.toString(), cacheField, convertToDto(yearData));
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    @Transactional
    public ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId) {
        ReentrantLock lock = lockManager.getLock(stockId + year);
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findByIdWithYearData(stockId).orElse(null);
            if (stockEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Stock not found: " + stockId)
                        .build();
            }

            StockEntity.StockYearData yearData = stockEntity.getYearData()
                    .computeIfAbsent(year, y -> new StockEntity.StockYearData());
            applyDtoToYearData(stockYearDataDto, yearData);

            stockService.recalculateValuations(stockEntity, year);
            stockRepository.save(stockEntity);
            String cacheField = stockEntity.getStockId() + ":" + year;
            redisDao.save(RedisEnum.STOCKYEARDATA.toString(), cacheField, convertToDto(yearData));
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    @Transactional
    public ResponseDto deleteStockYearData(StockYearDataDto stockYearDataDto) {
        String stockId = stockYearDataDto.getStockId();
        if (stockId == null) {
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(400)
                    .errorMessage("stockId is required")
                    .build();
        }

        ReentrantLock lock = lockManager.getLock(stockId);
        lock.lock();
        try {
            StockEntity stockEntity = stockRepository.findByIdWithYearData(stockId).orElse(null);
            if (stockEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Stock not found: " + stockId)
                        .build();
            }

            stockEntity.getYearData().clear();
            stockRepository.save(stockEntity);
            redisDao.delete(RedisEnum.STOCKYEARDATA.toString(), stockId);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseDto<List<StockYearDataHistoryResponseDto>> getValidationHistory(
            List<StockYearDataHistoryRequestDto> requests
    ) {
        if (requests == null || requests.isEmpty()) {
            return ResponseDto.<List<StockYearDataHistoryResponseDto>>builder()
                    .success(false)
                    .errorCode(400)
                    .errorMessage("validation history request is required")
                    .data(List.of())
                    .build();
        }

        List<StockYearDataHistoryResponseDto> records = new ArrayList<>();
        for (StockYearDataHistoryRequestDto request : requests) {
            if (request == null || request.getStockId() == null || request.getYear() == null) {
                continue;
            }

            StockEntity stockEntity = stockRepository.findByIdWithYearData(request.getStockId()).orElse(null);
            if (stockEntity == null || stockEntity.getYearData() == null) {
                continue;
            }

            StockEntity.StockYearData yearData = stockEntity.getYearData().get(request.getYear());
            if (yearData == null) {
                continue;
            }

            StockYearDataDto dto = convertToDto(yearData);
            dto.setStockId(request.getStockId());
            records.add(new StockYearDataHistoryResponseDto(request.getStockId(), request.getYear(), dto));
        }

        return ResponseDto.<List<StockYearDataHistoryResponseDto>>builder()
                .success(true)
                .data(records)
                .build();
    }

    private void applyDtoToYearData(StockYearDataDto dto, StockEntity.StockYearData yearData) {
        if (dto.getNetIncome() != null) yearData.setNetIncome(dto.getNetIncome());
        if (dto.getTotalEquity() != null) yearData.setTotalEquity(dto.getTotalEquity());
        if (dto.getIntangibles() != null) yearData.setIntangibles(dto.getIntangibles());
        if (dto.getOperatingCashFlow() != null) yearData.setOperatingCashFlow(dto.getOperatingCashFlow());
        if (dto.getFreeCashFlow() != null) yearData.setFreeCashFlow(dto.getFreeCashFlow());
        if (dto.getRevenue() != null) yearData.setRevenue(dto.getRevenue());
        if (dto.getDividendPerShare() != null) yearData.setDividendPerShare(dto.getDividendPerShare());
        if (dto.getSharesOutstanding() != null) yearData.setSharesOutstanding(dto.getSharesOutstanding());
        if (dto.getPriceEndYear() != null) yearData.setPriceEndYear(dto.getPriceEndYear());
        if (dto.getCostOfEquity() != null) yearData.setCostOfEquity(dto.getCostOfEquity());
        if (dto.getWacc() != null) yearData.setWacc(dto.getWacc());
        if (dto.getDividendGrowthRate() != null) yearData.setDividendGrowthRate(dto.getDividendGrowthRate());
    }

    private StockYearDataDto convertToDto(StockEntity.StockYearData yearData) {
        StockYearDataDto dto = new StockYearDataDto();
        dto.setNetIncome(yearData.getNetIncome());
        dto.setTotalEquity(yearData.getTotalEquity());
        dto.setIntangibles(yearData.getIntangibles());
        dto.setOperatingCashFlow(yearData.getOperatingCashFlow());
        dto.setFreeCashFlow(yearData.getFreeCashFlow());
        dto.setRevenue(yearData.getRevenue());
        dto.setDividendPerShare(yearData.getDividendPerShare());
        dto.setSharesOutstanding(yearData.getSharesOutstanding());
        dto.setPriceEndYear(yearData.getPriceEndYear());
        dto.setCostOfEquity(yearData.getCostOfEquity());
        dto.setWacc(yearData.getWacc());
        dto.setDividendGrowthRate(yearData.getDividendGrowthRate());
        dto.setDdm(yearData.getDdm());
        dto.setDcf(yearData.getDcf());
        dto.setRi(yearData.getRi());
        dto.setPe(yearData.getPe());
        dto.setPbv(yearData.getPbv());
        dto.setPcf(yearData.getPcf());
        dto.setPs(yearData.getPs());
        return dto;
    }
}
