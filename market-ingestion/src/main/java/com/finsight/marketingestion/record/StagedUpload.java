package com.finsight.marketingestion.record;

import java.time.LocalDateTime;
import java.util.List;

public record StagedUpload(
        String uploadId,
        String fileName,
        List<StockYearDataValidationRecord> records,
        List<UploadValidationIssue> errors,
        List<UploadValidationIssue> warnings,
        String status,
        LocalDateTime createdAt
) {
}
