package com.finsight.marketrealtime.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.*;
import com.finsight.marketrealtime.enums.RedisEnum;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.repository.AhpConfigRepository;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.service.AhpConfigService;
import com.finsight.marketrealtime.service.PortfolioAllocationService;
import com.finsight.marketrealtime.backtest.PortfolioAllocator;
import com.finsight.marketrealtime.valuation.TopsisCalculator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PortfolioAllocationServiceImpl implements PortfolioAllocationService {
    private static final Logger logger = LoggerFactory.getLogger(PortfolioAllocationServiceImpl.class);

    private final StockRepository stockRepository;
    private final AhpConfigRepository ahpConfigRepository;
    private final TopsisCalculator topsisCalculator;
    private final RedisDao redisDao;
    private final AhpConfigService ahpConfigService;
    private final ObjectMapper objectMapper;
    private final PortfolioAllocator portfolioAllocator;

    @Autowired
    public PortfolioAllocationServiceImpl(
            StockRepository stockRepository,
            AhpConfigRepository ahpConfigRepository,
            TopsisCalculator topsisCalculator,
            RedisDao redisDao,
            AhpConfigService ahpConfigService,
            ObjectMapper objectMapper,
            PortfolioAllocator portfolioAllocator) {
        this.stockRepository = stockRepository;
        this.ahpConfigRepository = ahpConfigRepository;
        this.topsisCalculator = topsisCalculator;
        this.redisDao = redisDao;
        this.ahpConfigService = ahpConfigService;
        this.objectMapper = objectMapper;
        this.portfolioAllocator = portfolioAllocator;
    }

    @Override
    public ResponseDto allocate(PortfolioAllocationRequest request) {
        if (request.getBudget() == null || request.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
            return errorResponse(400, "Budget must be positive");
        }
        if (request.getNumberOfStocks() <= 0) {
            return errorResponse(400, "Number of stocks must be positive");
        }
        int lotSize = request.getLotSize() > 0 ? request.getLotSize() : 100;

//        AhpConfigEntity ahpConfig = ahpConfigRepository.findByUserUserId(request.getUserId());
        AhpConfigDto ahpConfig = ahpConfigService.getAhpConfigByUserId(request.getUserId());
        if (ahpConfig == null) {
            return errorResponse(404, "AHP config not found for user: " + request.getUserId());
        }

        double[] weights;
        try {
            weights = objectMapper.readValue(ahpConfig.getWeightsJson(), double[].class);
        } catch (Exception e) {
            logger.error("Failed to parse AHP weights for user {}", request.getUserId(), e);
            return errorResponse(500, "Failed to parse AHP weights");
        }

        List<StockEntity> allStocks = stockRepository.findAllWithYearData();
        if (allStocks.isEmpty()) {
            return errorResponse(404, "No stocks available in the system");
        }

        List<RankedStockDto> ranked = topsisCalculator.rank(allStocks, weights);
        if (ranked.isEmpty()) {
            return errorResponse(404, "No stocks have sufficient data for ranking");
        }

        PortfolioAllocationResult result = portfolioAllocator.allocate(
                ranked, request.getBudget(), request.getNumberOfStocks(), lotSize);

        return ResponseDto.builder()
                .success(true)
                .data(result)
                .build();
    }

    private ResponseDto errorResponse(int code, String message) {
        return ResponseDto.builder()
                .success(false)
                .errorCode(code)
                .errorMessage(message)
                .build();
    }
}
