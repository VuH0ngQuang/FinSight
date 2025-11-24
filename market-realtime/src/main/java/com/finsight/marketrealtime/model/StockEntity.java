package com.finsight.marketrealtime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockEntity {
    @Id
    private String stockId;
    private String stockName;
    private String sector;
    @Column(precision = 10, scale = 2)
    private BigDecimal matchPrice;
    @Column(precision = 10, scale = 4)
    private BigDecimal peRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal pbRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal pcfRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal psRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal industryPeRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal industryPbRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal industryPcfRatio;
    @Column(precision = 10, scale = 4)
    private BigDecimal industryPsRatio;

    @ElementCollection
    @CollectionTable(name = "stock_year_data", joinColumns =
    @JoinColumn(name = "stockId"))
    @MapKeyColumn(name = "year")
    @Column(name = "unused")
    private Map<Integer, StockYearData> yearData = new HashMap<>();

    @ManyToMany
    @JoinTable(
            name = "user_favorite_stocks",
            joinColumns = @JoinColumn(name = "stockId"),
            inverseJoinColumns = @JoinColumn(name = "userId")
    )
    Set<UserEntity> favoredByUsers;

    @Embeddable
    @Data
    public static class StockYearData{
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
}
