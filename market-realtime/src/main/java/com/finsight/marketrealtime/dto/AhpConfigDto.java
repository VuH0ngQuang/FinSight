package com.finsight.marketrealtime.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AhpConfigDto {
    private UUID ahpConfigId;
    private UUID userId;
    private String criteriaJson;
    private String pairwiseMatrixJson;
    private String weightsJson;
}
