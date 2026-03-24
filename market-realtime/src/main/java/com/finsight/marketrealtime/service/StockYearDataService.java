package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;

public interface StockYearDataService {
    ResponseDto createStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId);
    ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId);
    ResponseDto deleteStockYearData(StockYearDataDto stockYearDataDto);
}
