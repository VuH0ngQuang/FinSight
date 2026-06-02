package com.finsight.marketrealtime.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockYearDataHistoryResponseDto {
    private String stockId;
    private Integer year;
    private StockYearDataDto data;
}
