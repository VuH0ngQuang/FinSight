package com.finsight.marketrealtime.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockYearDataDto {
    private BigDecimal netIncome;
    private BigDecimal totalEquity;
    private BigDecimal intangibles;
    private BigDecimal operatingCashFlow;
    private BigDecimal freeCashFlow;
    private BigDecimal revenue;
    private BigDecimal dividendPerShare;
    private Long sharesOutstanding;
    private BigDecimal priceEndYear;
    private BigDecimal costOfEquity;
    private BigDecimal wacc;
    private BigDecimal dividendGrowthRate;
    private BigDecimal ddm;
    private BigDecimal dcf;
    private BigDecimal ri;
    private BigDecimal pe;
    private BigDecimal pbv;
    private BigDecimal pcf;
    private BigDecimal ps;
}
