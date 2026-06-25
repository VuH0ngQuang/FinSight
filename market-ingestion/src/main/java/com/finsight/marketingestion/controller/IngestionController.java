package com.finsight.marketingestion.controller;

import com.finsight.marketingestion.dto.UploadValidationResponse;
import com.finsight.marketingestion.service.StockYearDataUploadService;
import com.finsight.marketingestion.validation.UploadValidationResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
public class IngestionController {
    private static final Logger log = LoggerFactory.getLogger(IngestionController.class);

    private final StockYearDataUploadService uploadService;

    @Autowired
    public IngestionController(StockYearDataUploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/api/stockYearDataUpload")
    public ResponseEntity<UploadValidationResponse> uploadStockData(@RequestParam("file") MultipartFile file) {
        log.info("Stock year data upload request received: {}", describeFile(file));
        try {
            UploadValidationResponse response = uploadService.uploadStockData(file);
            if ("FAILED".equals(response.getStatus())) {
                logValidationResult("Stock year data upload failed validation", response.getValidation());
                return ResponseEntity.badRequest().body(response);
            }
            log.info(
                    "Stock year data upload completed with status={}, uploadId={}",
                    response.getStatus(),
                    response.getUploadId()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Stock year data upload rejected: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new UploadValidationResponse("FAILED", null, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Stock year data upload failed unexpectedly", e);
            return ResponseEntity.internalServerError().body(new UploadValidationResponse("FAILED", null, "Failed to upload file: " + e.getMessage(), null));
        }
    }

    @PostMapping("/api/stockYearDataUpload/{uploadId}/confirm")
    public ResponseEntity<UploadValidationResponse> confirmUpload(@PathVariable String uploadId) {
        log.info("Stock year data upload confirm request received: uploadId={}", uploadId);
        try {
            UploadValidationResponse response = uploadService.confirmUpload(uploadId);
            log.info("Stock year data upload confirm completed: uploadId={}, status={}", uploadId, response.getStatus());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Stock year data upload confirm rejected: uploadId={}, reason={}", uploadId, e.getMessage());
            return ResponseEntity.badRequest().body(new UploadValidationResponse("FAILED", uploadId, e.getMessage(), null));
        } catch (Exception e) {
            log.error("Stock year data upload confirm failed unexpectedly: uploadId={}", uploadId, e);
            return ResponseEntity.internalServerError().body(new UploadValidationResponse("FAILED", uploadId, "Failed to confirm upload: " + e.getMessage(), null));
        }
    }

    private String describeFile(MultipartFile file) {
        if (file == null) {
            return "file=null";
        }
        return "name=" + file.getOriginalFilename()
                + ", contentType=" + file.getContentType()
                + ", size=" + file.getSize()
                + ", empty=" + file.isEmpty();
    }

    private void logValidationResult(String prefix, UploadValidationResult validation) {
        if (validation == null) {
            log.warn("{}: validation=null", prefix);
            return;
        }

        log.warn(
                "{}: errors={}, warnings={}",
                prefix,
                validation.getErrors().size(),
                validation.getWarnings().size()
        );
        validation.getErrors().forEach(issue ->
                log.warn("{} error: field={}, message={}", prefix, issue.field(), issue.message())
        );
        validation.getWarnings().forEach(issue ->
                log.warn("{} warning: field={}, message={}", prefix, issue.field(), issue.message())
        );
    }
}
