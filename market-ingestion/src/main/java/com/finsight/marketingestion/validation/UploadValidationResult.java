package com.finsight.marketingestion.validation;

import com.finsight.marketingestion.record.UploadValidationIssue;

import java.util.ArrayList;
import java.util.List;

public class UploadValidationResult {
    private final List<UploadValidationIssue> errors = new ArrayList<>();
    private final List<UploadValidationIssue> warnings = new ArrayList<>();

    public void addError(String field, String message) {
        errors.add(new UploadValidationIssue("ERROR", field, message));
    }

    public void addWarning(String field, String message) {
        warnings.add(new UploadValidationIssue("WARNING", field, message));
    }

    public void merge(UploadValidationResult other) {
        if (other == null) return;
        errors.addAll(other.getErrors());
        warnings.addAll(other.getWarnings());
    }

    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    public boolean hasWarnings() {
        return !warnings.isEmpty();
    }

    public List<UploadValidationIssue> getErrors() {
        return errors;
    }

    public List<UploadValidationIssue> getWarnings() {
        return warnings;
    }
}
