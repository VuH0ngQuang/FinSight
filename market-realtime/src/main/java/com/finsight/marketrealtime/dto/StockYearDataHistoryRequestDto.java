package com.finsight.marketrealtime.dto;

import lombok.Data;

@Data
public class StockYearDataHistoryRequestDto {
    private String stockId;
    private Integer year;
}
