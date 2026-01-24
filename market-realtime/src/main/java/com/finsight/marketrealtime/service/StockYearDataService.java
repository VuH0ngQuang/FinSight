package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.StockYearDataDto;

public interface StockYearDataService {
    public ResponseDto updateStockYearData(StockYearDataDto stockYearDataDto, int year, String stockId);
}
