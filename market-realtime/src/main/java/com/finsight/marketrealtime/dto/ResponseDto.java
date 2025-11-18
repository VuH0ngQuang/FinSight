package com.finsight.marketrealtime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDto<T> {
    private boolean success;
    private int errorCode;
    private String errorMessage;
    private T data;
}
