package com.finsight.marketingestion.dto;

import com.finsight.marketingestion.model.StockYearData;
import lombok.Data;

@Data
public class StockYearDataHistoryResponseDto {
    private String stockId;
    private Integer year;
    private StockYearData data;
}
