package com.finsight.marketrealtime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RankedStockDto {
    private String stockId;
    private String stockName;
    private double topsisScore;
    private BigDecimal matchPrice;
}
