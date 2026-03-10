package com.finsight.marketingestion.model;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockYearData {
    private String stockId;
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
