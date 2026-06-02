package com.finsight.marketingestion.dto;

import com.finsight.marketingestion.validation.UploadValidationResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadValidationResponse {
    private String status;
    private String uploadId;
    private String message;
    private UploadValidationResult validation;

    public static UploadValidationResponse failed(UploadValidationResult validation) {
        return new UploadValidationResponse("FAILED", null, "Upload validation failed", validation);
    }

    public static UploadValidationResponse waitingConfirmation(String uploadId, UploadValidationResult validation) {
        return new UploadValidationResponse("WAITING_CONFIRMATION", uploadId, "Upload needs user confirmation", validation);
    }

    public static UploadValidationResponse success() {
        return new UploadValidationResponse("SUCCESS", null, "Stock data uploaded successfully", new UploadValidationResult());
    }

    public static UploadValidationResponse confirmed() {
        return new UploadValidationResponse("CONFIRMED", null, "Stock data confirmed and sent to Kafka", new UploadValidationResult());
    }
}
