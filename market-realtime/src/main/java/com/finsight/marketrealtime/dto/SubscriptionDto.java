package com.finsight.marketrealtime.dto;

import com.finsight.marketrealtime.enums.SubscriptionEnum;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SubscriptionDto {
    private long subscriptionId;
    private long userId;
    private int subscriptionPlanId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String errorMessage;
    private String type;
    public SubscriptionEnum status;
}
