package com.finsight.marketingestion.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketingestion.configurations.AppConf;
import com.finsight.marketingestion.daos.RedisDao;
import com.finsight.marketingestion.dto.ResponseDto;
import com.finsight.marketingestion.dto.StockYearDataHistoryRequestDto;
import com.finsight.marketingestion.dto.StockYearDataHistoryResponseDto;
import com.finsight.marketingestion.dto.UploadValidationResponse;
import com.finsight.marketingestion.enums.RedisEnum;
import com.finsight.marketingestion.kafka.KafkaRequestResponseService;
import com.finsight.marketingestion.model.StockYearData;
import com.finsight.marketingestion.producer.KafkaProducer;
import com.finsight.marketingestion.record.StagedUpload;
import com.finsight.marketingestion.record.StockYearDataValidationRecord;
import com.finsight.marketingestion.validation.BusinessValidation;
import com.finsight.marketingestion.validation.FileValidation;
import com.finsight.marketingestion.validation.StructureValidation;
import com.finsight.marketingestion.validation.UploadValidationResult;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class StockYearDataUploadService {

    private static final Logger log = LoggerFactory.getLogger(StockYearDataUploadService.class);
    private static final Duration STAGED_UPLOAD_TTL = Duration.ofMinutes(30);

    private final KafkaProducer kafkaProducer;
    private final AppConf appConf;
    private final ObjectMapper objectMapper;
    private final FileValidation fileValidation;
    private final StructureValidation structureValidation;
    private final BusinessValidation businessValidation;
    private final KafkaRequestResponseService kafkaRequestResponseService;
    private final RedisDao redisDao;

    @Autowired
    public StockYearDataUploadService(
            KafkaProducer kafkaProducer,
            AppConf appConf,
            ObjectMapper objectMapper,
            FileValidation fileValidation,
            StructureValidation structureValidation,
            BusinessValidation businessValidation,
            KafkaRequestResponseService kafkaRequestResponseService,
            RedisDao redisDao
    ) {
        this.kafkaProducer = kafkaProducer;
        this.appConf = appConf;
        this.objectMapper = objectMapper;
        this.fileValidation = fileValidation;
        this.structureValidation = structureValidation;
        this.businessValidation = businessValidation;
        this.kafkaRequestResponseService = kafkaRequestResponseService;
        this.redisDao = redisDao;
    }

    public UploadValidationResponse uploadStockData(MultipartFile file) throws Exception {
        UploadValidationResult result = fileValidation.validate(file);
        if (result.hasErrors()) {
            return UploadValidationResponse.failed(result);
        }

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            structureValidation.validateWorkbook(workbook, result);
            if (result.hasErrors()) {
                return UploadValidationResponse.failed(result);
            }

            List<StockYearDataValidationRecord> records = parseStockData(workbook);
            List<StockYearDataHistoryResponseDto> historyRecords = fetchHistoryRecords(records, result);
            result.merge(businessValidation.validate(records, historyRecords));

            if (result.hasErrors()) {
                return UploadValidationResponse.failed(result);
            }

            if (result.hasWarnings()) {
                String uploadId = stageUpload(file, records, result);
                return UploadValidationResponse.waitingConfirmation(uploadId, result);
            }

            publishRecords(records);
            return UploadValidationResponse.success();
        }
    }

    public UploadValidationResponse confirmUpload(String uploadId) throws Exception {
        StagedUpload stagedUpload = redisDao.find(RedisEnum.UPLOAD_VALIDATION.toString(), uploadId, StagedUpload.class);
        if (stagedUpload == null) {
            throw new IllegalArgumentException("Upload validation session not found or expired");
        }

        publishRecords(stagedUpload.records());
        redisDao.delete(RedisEnum.UPLOAD_VALIDATION.toString(), uploadId);
        return UploadValidationResponse.confirmed();
    }

    private List<StockYearDataValidationRecord> parseStockData(Workbook workbook) throws JsonProcessingException {
        List<StockYearDataValidationRecord> records = new ArrayList<>();

        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            Sheet sheet = workbook.getSheetAt(i);
            if (sheet == null) {
                continue;
            }
            records.addAll(parseStockData(sheet));
        }

        return records;
    }

    private List<StockYearDataValidationRecord> parseStockData(Sheet sheet) throws JsonProcessingException {
        List<StockYearDataValidationRecord> records = new ArrayList<>();
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            return records;
        }

        List<Integer> years = new ArrayList<>();
        for (int col = 1; col < headerRow.getLastCellNum(); col++) {
            Cell cell = headerRow.getCell(col);
            if (cell != null) {
                int year = (int) getCellNumericValue(cell);
                years.add(year);
            }
        }

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

        String stockId = sheet.getSheetName();

        for (int yearIndex = 0; yearIndex < years.size(); yearIndex++) {
            int year = years.get(yearIndex);
            int colIndex = yearIndex + 1;

            StockYearData stockData = new StockYearData();
            stockData.setStockId(stockId);

            for (Map.Entry<String, Integer> entry : metricRowMap.entrySet()) {
                String metricName = entry.getKey();
                int rowIndex = entry.getValue() + 1;

                Row row = sheet.getRow(rowIndex);
                if (row != null) {
                    Cell cell = row.getCell(colIndex);
                    if (cell != null) {
                        BigDecimal value = getCellBigDecimalValue(cell);
                        setMetricValue(stockData, metricName, value);
                    }
                }
            }

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

            records.add(new StockYearDataValidationRecord(stockId, year, stockData));
        }

        return records;
    }

    private List<StockYearDataHistoryResponseDto> fetchHistoryRecords(
            List<StockYearDataValidationRecord> records,
            UploadValidationResult result
    ) {
        List<StockYearDataHistoryRequestDto> requests = buildHistoryRequests(records);
        if (requests.isEmpty()) {
            return List.of();
        }

        try {
            ResponseDto<List<StockYearDataHistoryResponseDto>> response =
                    kafkaRequestResponseService.getStockYearDataValidationHistory(requests);

            if (response == null || !response.isSuccess()) {
                result.addWarning("history", "Could not load previous year data for YoY validation");
                return List.of();
            }

            return response.getData() == null ? List.of() : response.getData();
        } catch (Exception e) {
            log.warn("Could not load previous year data for YoY validation", e);
            result.addWarning("history", "Could not load previous year data for YoY validation");
            return List.of();
        }
    }

    private List<StockYearDataHistoryRequestDto> buildHistoryRequests(List<StockYearDataValidationRecord> records) {
        Set<String> requestedKeys = new HashSet<>();
        List<StockYearDataHistoryRequestDto> requests = new ArrayList<>();

        for (StockYearDataValidationRecord record : records) {
            if (record == null || record.stockId() == null || record.year() == null) {
                continue;
            }

            String key = record.stockId() + ":" + (record.year() - 1);
            if (requestedKeys.add(key)) {
                requests.add(new StockYearDataHistoryRequestDto(record.stockId(), record.year() - 1));
            }
        }

        return requests;
    }

    private String stageUpload(
            MultipartFile file,
            List<StockYearDataValidationRecord> records,
            UploadValidationResult result
    ) {
        String uploadId = UUID.randomUUID().toString();
        StagedUpload stagedUpload = new StagedUpload(
                uploadId,
                file.getOriginalFilename(),
                records,
                result.getErrors(),
                result.getWarnings(),
                "WAITING_CONFIRMATION",
                LocalDateTime.now()
        );

        redisDao.save(RedisEnum.UPLOAD_VALIDATION.toString(), uploadId, stagedUpload, STAGED_UPLOAD_TTL);
        return uploadId;
    }

    private void publishRecords(List<StockYearDataValidationRecord> records) throws JsonProcessingException {
        List<StockYearDataValidationRecord> sortedRecords = records.stream()
                .filter(record -> record != null && record.year() != null && record.data() != null)
                .sorted(Comparator.comparing(StockYearDataValidationRecord::stockId).thenComparing(StockYearDataValidationRecord::year))
                .toList();

        for (StockYearDataValidationRecord record : sortedRecords) {
            String message = objectMapper.writeValueAsString(record.data());
            kafkaProducer.publish(message, appConf.getUri().getStockYearData().getUpdate() + record.year());
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
