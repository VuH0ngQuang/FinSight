package com.finsight.marketingestion.record;

public record UploadValidationIssue(
        String severity,
        String field,
        String message
) {}
