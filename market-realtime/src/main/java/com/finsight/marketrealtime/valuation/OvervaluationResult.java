package com.finsight.marketrealtime.valuation;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OvervaluationResult {
    private String stockId;
    private String stockName;
    private int totalIndicators;
    private int overvaluedCount;
    private double overvaluePercent;
    private boolean overvalued;
    private Map<String, Boolean> indicatorResults;
}
