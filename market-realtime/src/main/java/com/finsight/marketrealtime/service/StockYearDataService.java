package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockYearDataHistoryRequestDto;
import com.finsight.marketrealtime.dto.StockYearDataHistoryResponseDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;

import java.util.List;

public interface StockYearDataService {
    ResponseDto createStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId);
    ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId);
    ResponseDto deleteStockYearData(StockYearDataDto stockYearDataDto);
    ResponseDto<List<StockYearDataHistoryResponseDto>> getValidationHistory(List<StockYearDataHistoryRequestDto> requests);
}
