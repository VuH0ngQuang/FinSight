package com.finsight.marketingestion.validation;

import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class StructureValidation {
    private static final Logger log = LoggerFactory.getLogger(StructureValidation.class);

    private static final int HEADER_ROW_INDEX = 0;
    private static final int FIRST_YEAR_COLUMN = 1;

    private static final List<String> REQUIRED_METRICS = List.of(
            "netIncome",
            "totalEquity",
            "intangibles",
            "operatingCashFlow",
            "freeCashFlow",
            "revenue",
            "dividendPerShare",
            "sharesOutstanding",
            "priceEndYear",
            "costOfEquity",
            "wacc",
            "dividendGrowthRate"
    );

    public void validateWorkbook(Workbook workbook, UploadValidationResult result) {
        if (workbook == null) {
            result.addError("workbook","Workbook could not be read");
            return;
        }
        if (workbook.getNumberOfSheets() == 0) {
            result.addError("workbook", "Workbook must contain at least one sheet");
            return;
        }
        for (int sheetIndex = 0; sheetIndex < workbook.getNumberOfSheets(); sheetIndex++) {
            validateSheet(workbook.getSheetAt(sheetIndex), sheetIndex, result);
        }
    }

    private void validateSheet(Sheet sheet, int sheetIndex, UploadValidationResult result) {
        String sheetName = sheet.getSheetName();

        if (sheet == null) {
            result.addError(sheetName,"Sheet is missing");
            return;
        }
        if (sheetName == null || sheetName.isBlank()) {
            result.addError("sheet["+sheetIndex+"]","Sheet name must be stockId");
        }
        Row headerRow = sheet.getRow(HEADER_ROW_INDEX);
        if (headerRow == null) {
            result.addError(sheetName, "Missing header row with years");
            return;
        }
        short lastCellNum = headerRow.getLastCellNum();
        if (lastCellNum <= FIRST_YEAR_COLUMN) {
            result.addError(sheetName, "Header row must be contain at least one year from column B onward");
            return;
        }

        Set<Integer> years = new HashSet<>();

        for(int col = FIRST_YEAR_COLUMN; col < lastCellNum; col++) {
            Cell yearCell = headerRow.getCell(col);
            Integer year = readYear(yearCell);

            if (year == null) {
                result.addError(location(sheetName,1,col+1), "Year header must be numeric");
                continue;
            }
            if (year < 1990 || year > 2100) {
                result.addError(location(sheetName,1,col+1), "Year is outside allowed range: "+year);
            }
            if (!years.add(year)) {
                result.addError(location(sheetName,1,col+1), "Duplicated year: "+year);
            }
        }

        for (int metricIndex = 0; metricIndex < REQUIRED_METRICS.size(); metricIndex++) {
            String metric = REQUIRED_METRICS.get(metricIndex);
            int rowIndex = metricIndex + 1;

            Row row = sheet.getRow(rowIndex);
            if (row == null) {
                result.addError(location(sheetName, rowIndex+1,1), "Missing row for metric: "+metric);
                continue;
            }
            for (int col = FIRST_YEAR_COLUMN; col < lastCellNum; col++) {
                Cell cell = row.getCell(col);

                if (cell == null || cell.getCellType() == CellType.BLANK) {
                    result.addError(location(sheetName,rowIndex+1,col+1), "Missing value for "+metric);
                    continue;
                }
                if (!isNumericLike(cell)) {
                    result.addError(location(sheetName,rowIndex+1,col+1), "Value for "+metric+" must be numeric");
                }
            }
        }
    }

    private Integer readYear(Cell cell) {
        if (cell == null) return null;

        try {
            return switch (cell.getCellType()) {
                case NUMERIC, FORMULA -> (int) cell.getNumericCellValue();
                case STRING -> Integer.parseInt(cell.getStringCellValue().trim());
                default -> null;
            };
        } catch (Exception e) {
            log.error("Their is an error during readYear: {}",e.toString());
            return null;
        }
    }

    private String location(String sheetName, int row, int col) {
        return sheetName+"!R"+row+"C"+col;
    }

    private boolean isNumericLike(Cell cell) {
        try {
            return switch (cell.getCellType()) {
                case NUMERIC,FORMULA -> true;
                case STRING -> {
                    String value = cell.getStringCellValue().trim();
                    if (value.isEmpty()) yield false;
                    new java.math.BigDecimal(value);
                    yield true;
                }
                default -> false;
            };
        } catch (Exception e) {
            log.error("Failed to determine whether cell value is numeric", e);
            return false;
        }
    }
}
