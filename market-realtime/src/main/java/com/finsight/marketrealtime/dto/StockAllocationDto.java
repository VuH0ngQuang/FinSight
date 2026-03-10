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
public class StockAllocationDto {
    private String stockId;
    private String stockName;
    private int shares;
    private BigDecimal pricePerShare;
    private BigDecimal totalCost;
    private double topsisScore;
    private double allocationPercentage;
}
