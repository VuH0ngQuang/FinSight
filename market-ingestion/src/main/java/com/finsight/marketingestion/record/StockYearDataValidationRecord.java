package com.finsight.marketingestion.record;

import com.finsight.marketingestion.model.StockYearData;

public record StockYearDataValidationRecord(
        String stockId,
        Integer year,
        StockYearData data
) {
}
