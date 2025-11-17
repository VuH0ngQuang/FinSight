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

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockEntity {
    @Id
    private String stockId;
    private String stockName;
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
    HashSet<UserEntity> favoredByUsers;

    @Embeddable
    @Data
    private static class StockYearData{
        public BigDecimal netIncome;
        public BigDecimal totalEquity;
        public BigDecimal intangibles;
        public BigDecimal operatingCashFlow;
        public BigDecimal freeCashFlow;
        public BigDecimal revenue;
        public BigDecimal dividendPerShare;
        public Long sharesOutstanding;
        public BigDecimal priceEndYear;
        public BigDecimal costOfEquity;
        public BigDecimal wacc;
        public BigDecimal dividendGrowthRate;
    }
}
