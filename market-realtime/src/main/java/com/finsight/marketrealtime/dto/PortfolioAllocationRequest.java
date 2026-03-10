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
public class PortfolioAllocationRequest {
    private long userId;
    private BigDecimal budget;
    private int numberOfStocks;
    @Builder.Default
    private int lotSize = 100;
}
