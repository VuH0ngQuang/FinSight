package com.finsight.marketrealtime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioAllocationResult {
    private List<StockAllocationDto> allocations;
    private BigDecimal totalInvestment;
    private BigDecimal remainingBudget;
    private BigDecimal budget;
    private int numberOfStocks;
    private double budgetUtilizationPercent;
}
