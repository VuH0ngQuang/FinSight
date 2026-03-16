package com.finsight.marketingestion.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketingestion.configurations.AppConf;
import com.finsight.marketingestion.model.StockYearData;
import com.finsight.marketingestion.producer.KafkaProducer;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class IngestionController {

    private static final Logger log = LoggerFactory.getLogger(IngestionController.class);
    private final KafkaProducer kafkaProducer;
    private final AppConf appConf;
    private final ObjectMapper objectMapper;

    @Autowired
    public IngestionController(
            KafkaProducer kafkaProducer,
            AppConf appConf,
            ObjectMapper objectMapper
            ) {
        this.kafkaProducer = kafkaProducer;
        this.appConf = appConf;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/api/stockYearDataUpload")
    public ResponseEntity<String> uploadStockData(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (!contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            && !contentType.equals("application/vnd.ms-excel")) {
            return ResponseEntity.badRequest().body("Only Excel files are allowed");
        }

        try {
            InputStream inputStream = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(inputStream);

            // Iterate over all sheets in the workbook
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                if (sheet == null) {
                    continue;
                }
                 parseStockData(sheet);
            }

            workbook.close();
            return ResponseEntity.ok("Stock data uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upload file: " + e.getMessage());
        }
    }
    
    private void parseStockData(Sheet sheet) throws JsonProcessingException {
        
        // Read first row to get years (column headers)
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            return;
        }
        
        List<Integer> years = new ArrayList<>();
        for (int col = 1; col < headerRow.getLastCellNum(); col++) {
            Cell cell = headerRow.getCell(col);
            if (cell != null) {
                int year = (int) getCellNumericValue(cell);
                years.add(year);
            }
        }
        
        // Map of metric names to their row indices
        Map<String, Integer> metricRowMap = new HashMap<>();
        metricRowMap.put("netIncome", 0);
        metricRowMap.put("totalEquity", 1);
        metricRowMap.put("intangibles", 2);
        metricRowMap.put("operatingCashFlow", 3);
        metricRowMap.put("freeCashFlow", 4);
        metricRowMap.put("revenue", 5);
        metricRowMap.put("dividendPerShare", 6);
        metricRowMap.put("sharesOutstanding", 7);
        metricRowMap.put("priceEndYear", 8);
        metricRowMap.put("costOfEquity", 9);
        metricRowMap.put("wacc", 10);
        metricRowMap.put("dividendGrowthRate", 11);
        
        // Get stockId from sheet name
        String stockId = sheet.getSheetName();
        
        // For each year, create a StockYearData object
        for (int yearIndex = 0; yearIndex < years.size(); yearIndex++) {
            int year = years.get(yearIndex);
            int colIndex = yearIndex + 1; // +1 because first column is metric names
            
            StockYearData stockData = new StockYearData();
            stockData.setStockId(stockId);
            
            // Read each metric from its row
            for (Map.Entry<String, Integer> entry : metricRowMap.entrySet()) {
                String metricName = entry.getKey();
                int rowIndex = entry.getValue() + 1; // +1 because first row is headers
                
                Row row = sheet.getRow(rowIndex);
                if (row != null) {
                    Cell cell = row.getCell(colIndex);
                    if (cell != null) {
                        BigDecimal value = getCellBigDecimalValue(cell);
                        setMetricValue(stockData, metricName, value);
                    }
                }
            }

            // Log for debugging: stockId, year, and all metrics for this year (INFO so it shows in terminal)
            log.info(
                    "stockId={}, year={}, netIncome={}, totalEquity={}, intangibles={}, operatingCashFlow={}, freeCashFlow={}, revenue={}, " +
                            "dividendPerShare={}, sharesOutstanding={}, priceEndYear={}, costOfEquity={}, wacc={}, dividendGrowthRate={}",
                    stockId,
                    year,
                    stockData.getNetIncome(),
                    stockData.getTotalEquity(),
                    stockData.getIntangibles(),
                    stockData.getOperatingCashFlow(),
                    stockData.getFreeCashFlow(),
                    stockData.getRevenue(),
                    stockData.getDividendPerShare(),
                    stockData.getSharesOutstanding(),
                    stockData.getPriceEndYear(),
                    stockData.getCostOfEquity(),
                    stockData.getWacc(),
                    stockData.getDividendGrowthRate()
            );

            //add kafka
            String message = objectMapper.writeValueAsString(stockData);
            kafkaProducer.publish(message, appConf.getUri().getStockYearData().getUpdate()+year);
        }
    }
    
    private void setMetricValue(StockYearData stockData, String metricName, BigDecimal value) {
        switch (metricName) {
            case "netIncome":
                stockData.setNetIncome(value);
                break;
            case "totalEquity":
                stockData.setTotalEquity(value);
                break;
            case "intangibles":
                stockData.setIntangibles(value);
                break;
            case "operatingCashFlow":
                stockData.setOperatingCashFlow(value);
                break;
            case "freeCashFlow":
                stockData.setFreeCashFlow(value);
                break;
            case "revenue":
                stockData.setRevenue(value);
                break;
            case "dividendPerShare":
                stockData.setDividendPerShare(value);
                break;
            case "sharesOutstanding":
                stockData.setSharesOutstanding(value != null ? value.longValue() : null);
                break;
            case "priceEndYear":
                stockData.setPriceEndYear(value);
                break;
            case "costOfEquity":
                stockData.setCostOfEquity(value);
                break;
            case "wacc":
                stockData.setWacc(value);
                break;
            case "dividendGrowthRate":
                stockData.setDividendGrowthRate(value);
                break;
        }
    }
    
    private BigDecimal getCellBigDecimalValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return BigDecimal.valueOf(cell.getNumericCellValue());
            case STRING:
                String str = cell.getStringCellValue().trim();
                if (str.isEmpty()) {
                    return null;
                }
                try {
                    return new BigDecimal(str);
                } catch (NumberFormatException e) {
                    return null;
                }
            case FORMULA:
                return BigDecimal.valueOf(cell.getNumericCellValue());
            default:
                return null;
        }
    }
    
    private double getCellNumericValue(Cell cell) {
        if (cell == null) {
            return 0.0;
        }
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            case FORMULA:
                return cell.getNumericCellValue();
            default:
                return 0.0;
        }
    }
}