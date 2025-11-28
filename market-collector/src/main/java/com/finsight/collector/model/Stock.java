package com.finsight.collector.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class Stock {
    private String stockId;
    private BigDecimal matchPrice;
}