package com.finsight.marketingestion.controller;

import com.finsight.marketingestion.dto.UploadValidationResponse;
import com.finsight.marketingestion.service.StockYearDataUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
public class IngestionController {

    private final StockYearDataUploadService uploadService;

    @Autowired
    public IngestionController(StockYearDataUploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/api/stockYearDataUpload")
    public ResponseEntity<UploadValidationResponse> uploadStockData(@RequestParam("file") MultipartFile file) {
        try {
            UploadValidationResponse response = uploadService.uploadStockData(file);
            if ("FAILED".equals(response.getStatus())) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new UploadValidationResponse("FAILED", null, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new UploadValidationResponse("FAILED", null, "Failed to upload file: " + e.getMessage(), null));
        }
    }

    @PostMapping("/api/stockYearDataUpload/{uploadId}/confirm")
    public ResponseEntity<UploadValidationResponse> confirmUpload(@PathVariable String uploadId) {
        try {
            return ResponseEntity.ok(uploadService.confirmUpload(uploadId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new UploadValidationResponse("FAILED", uploadId, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new UploadValidationResponse("FAILED", uploadId, "Failed to confirm upload: " + e.getMessage(), null));
        }
    }
}
