package com.finsight.marketingestion.validation;

import com.finsight.marketingestion.dto.StockYearDataHistoryResponseDto;
import com.finsight.marketingestion.model.StockYearData;
import com.finsight.marketingestion.record.StockYearDataValidationRecord;
import com.finsight.marketingestion.record.UploadValidationIssue;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Year;
import java.util.*;

@Component
public class BusinessValidation {
    private static final BigDecimal WACC_MIN_NORMAL = new BigDecimal("0.04");
    private static final BigDecimal WACC_MAX_NORMAL = new BigDecimal("0.25");
    private static final BigDecimal WACC_MIN_ACCEPTABLE = new BigDecimal("0.03");
    private static final BigDecimal WACC_MAX_ACCEPTABLE = new BigDecimal("0.40");

    private static final BigDecimal YOY_WARNING_CHANGE = new BigDecimal("1.00");
    private static final BigDecimal SHARES_YOY_WARNING_CHANGE = new BigDecimal("0.50");

    public UploadValidationResult validate(List<StockYearDataValidationRecord> records,
                                           List<StockYearDataHistoryResponseDto> historyRecords
    ) {
        UploadValidationResult result = new UploadValidationResult();

        if (records == null || records.isEmpty()) {
            result.addError("file", "No stock year data found");
            return result;
        }

        Map<String, StockYearData> historyByStockYear = buildHistoryMap(historyRecords);

        for (StockYearDataValidationRecord record : records) {
            validateRequiredFields(record, result);

            if (record == null || record.data() == null) continue;

            validateMetricRange(record, result);
        }

        validateYoY(records, historyByStockYear, result);

        return result;
    }

    private Map<String, StockYearData> buildHistoryMap (List<StockYearDataHistoryResponseDto> historyRecords) {
        Map<String, StockYearData> historyByStockYear = new HashMap<>();

        if (historyRecords == null) return historyByStockYear;

        for (StockYearDataHistoryResponseDto record : historyRecords) {
            if (record == null || record.getStockId() == null || record.getYear() == null || record.getData() == null) {
                continue;
            }

            historyByStockYear.put(key(record.getStockId(), record.getYear()), record.getData());
        }

        return historyByStockYear;
    }

    private String key (String stockId, int year) {return stockId+":"+year;}

    private String field (StockYearDataValidationRecord record, String fieldName) {
        if (record == null) return fieldName;
        return record.stockId()+":"+record.year()+":"+fieldName;
    }

    private void validateRequiredFields (StockYearDataValidationRecord record, UploadValidationResult result) {
        if (record == null) {
            result.addError("record", "Record is empty");
            return;
        }
        if (record.stockId() == null || record.stockId().isBlank() || record.stockId().isEmpty()) result.addError("stockId", "Stock id is required");
        if (record.year() == null || record.year() <= 0) result.addError(field(record, "year"), "Year is required");
        if (record.data() == null) result.addError(field(record,"data"), "Stock year data is required");
    }

    private void validateMetricRange(StockYearDataValidationRecord record, UploadValidationResult result) {
        StockYearData data = record.data();

        if (data.getWacc() != null) {
            if (data.getWacc().compareTo(WACC_MIN_ACCEPTABLE) < 0 || data.getWacc().compareTo(WACC_MAX_ACCEPTABLE) > 0) {
                result.addError(field(record, "wacc"), "WACC is outside acceptable range");
            } else if (data.getWacc().compareTo(WACC_MIN_NORMAL) < 0 || data.getWacc().compareTo(WACC_MAX_NORMAL) > 0) result.addWarning(field(record, "wacc"), "WACC is outside normal range");
        }
        if (data.getRevenue() != null && data.getRevenue().compareTo(BigDecimal.ZERO) < 0) result.addWarning(field(record, "revenue"), "Revenue is negative");
        if (data.getTotalEquity() != null && data.getTotalEquity().compareTo(BigDecimal.ZERO) <= 0) result.addError(field(record, "totalEquity"), "Total equity must be greater than zero");
        if (data.getSharesOutstanding() != null && data.getSharesOutstanding() <= 0) result.addError(field(record, "sharesOutstanding"), "Shares outstanding must be greater than zero");
        if (data.getPriceEndYear() != null && data.getPriceEndYear().compareTo(BigDecimal.ZERO) <= 0) result.addError(field(record, "priceEndYear"), "Price end year must be greater than zero");
        if (data.getCostOfEquity() != null && data.getDividendGrowthRate() != null && data.getDividendGrowthRate().compareTo(data.getCostOfEquity()) >= 0) result.addError(field(record, "dividendGrowthRate"), "Dividend growth rate must be lower than cost of equity");
        if (data.getFreeCashFlow() != null && data.getFreeCashFlow().compareTo(BigDecimal.ZERO) < 0) result.addWarning(field(record, "freeCashFlow"), "Free cash flow is negative");
    }

    private void validateYoY(
            List<StockYearDataValidationRecord> records,
            Map<String, StockYearData> historyByStockYear,
            UploadValidationResult result
    ) {
        List<StockYearDataValidationRecord> sortedRecords = records.stream()
                .filter(record -> record != null && record.stockId() != null && record.data() != null)
                .sorted(Comparator.comparing(StockYearDataValidationRecord::stockId).thenComparing(StockYearDataValidationRecord::year))
                .toList();

        Map<String, StockYearData> seenByStockYear = new HashMap<>();

        for (StockYearDataValidationRecord record : sortedRecords) {
            StockYearData previousData = seenByStockYear.get(key(record.stockId(), record.year() - 1));

            if (previousData == null) {
                previousData = historyByStockYear.get(key(record.stockId(), record.year() - 1));
            }

            if (previousData != null) {
                warnLargeYoYChange(record, "revenue", previousData.getRevenue(), record.data().getRevenue(), YOY_WARNING_CHANGE, result);
                warnLargeYoYChange(record, "totalEquity", previousData.getTotalEquity(), record.data().getTotalEquity(), YOY_WARNING_CHANGE, result);
                warnLargeYoYChange(record, "priceEndYear", previousData.getPriceEndYear(), record.data().getPriceEndYear(), YOY_WARNING_CHANGE, result);

                if (previousData.getSharesOutstanding() != null &&
                        record.data().getSharesOutstanding() != null) {
                    warnLargeYoYChange(
                            record,
                            "sharesOutstanding",
                            BigDecimal.valueOf(previousData.getSharesOutstanding()),
                            BigDecimal.valueOf(record.data().getSharesOutstanding()),
                            SHARES_YOY_WARNING_CHANGE,
                            result
                    );
                }
            }

            seenByStockYear.put(key(record.stockId(), record.year()), record.data());
        }
    }

    private void warnLargeYoYChange(
            StockYearDataValidationRecord record,
            String metric,
            BigDecimal previousValue,
            BigDecimal currentValue,
            BigDecimal warningChange,
            UploadValidationResult result
    ) {
        if (previousValue == null || currentValue == null || previousValue.compareTo(BigDecimal.ZERO) == 0) return;

        BigDecimal change = currentValue.subtract(previousValue).abs().divide(previousValue.abs(), 4, java.math.RoundingMode.HALF_UP);

        if (change.compareTo(warningChange) > 0) result.addWarning(field(record, metric), metric + " changed more than expected YoY");

    }
}
