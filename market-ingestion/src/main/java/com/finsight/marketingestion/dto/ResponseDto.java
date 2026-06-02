package com.finsight.marketingestion.dto;

import lombok.Data;

@Data
public class ResponseDto<T> {
    private boolean success;
    private int errorCode;
    private String errorMessage;
    private T data;
}
