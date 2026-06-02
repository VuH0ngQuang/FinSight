package com.finsight.marketingestion.validation;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class FileValidation {
    private static final Set<String> ALLOWED_CONTENT_TYPE = Set.of(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
    );

    public UploadValidationResult validate (MultipartFile file) {
        UploadValidationResult result = new UploadValidationResult();

        if (file == null || file.isEmpty()) {
            result.addError("file", "Upload file is required");
            return result;
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            result.addError("file", "File name is required");
        } else if (!filename.toLowerCase().endsWith(".xlsx")) {
            result.addError("file", "Only .xlsx files are supported");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPE.contains(contentType)) {
            result.addError("file", "Invalid content type: "+contentType+". Expect an Excel file");
        }

        return result;
    }
}
