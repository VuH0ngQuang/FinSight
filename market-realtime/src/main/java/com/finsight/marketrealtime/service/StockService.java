package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;
import com.finsight.marketrealtime.model.StockEntity;

import java.math.BigDecimal;

public interface StockService {
    ResponseDto createStock(StockDto stockDto);
    ResponseDto updateStock(StockDto stockDto);
    ResponseDto deleteStock(StockDto stockDto);
    ResponseDto updateIndustryRatios(StockDto stockDto);
    void updateMatchPrice(String stockId, BigDecimal matchPrice);
    void recalculateValuations(StockEntity stockEntity, int targetYear) ;
    StockDto convertToDto(StockEntity stockEntity);
}
