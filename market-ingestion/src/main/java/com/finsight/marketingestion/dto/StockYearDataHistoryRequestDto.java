package com.finsight.marketingestion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockYearDataHistoryRequestDto {
    private String stockId;
    private Integer year;
}
