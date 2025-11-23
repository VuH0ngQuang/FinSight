package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;

import java.math.BigDecimal;

public interface StockService {
    ResponseDto createStock(StockDto stockDto);
    ResponseDto updateStock(StockDto stockDto);
    ResponseDto deleteStock(StockDto stockDto);
    ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto,int year, String stockId);
    ResponseDto updateIndustryRatios(StockDto stockDto);
    void updateMatchPrice(String stockId, BigDecimal matchPrice);
}
