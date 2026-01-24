package com.finsight.marketrealtime.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StockDto {
    private String stockId;
    private String stockName;
    private String sector;
    private BigDecimal matchPrice;
    private BigDecimal peRatio;
    private BigDecimal pbRatio;
    private BigDecimal pcfRatio;
    private BigDecimal psRatio;
    private BigDecimal industryPeRatio;
    private BigDecimal industryPbRatio;
    private BigDecimal industryPcfRatio;
    private BigDecimal industryPsRatio;
}
