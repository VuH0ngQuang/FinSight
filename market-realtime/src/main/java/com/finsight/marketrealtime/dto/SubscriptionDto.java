package com.finsight.marketrealtime.dto;

import com.finsight.marketrealtime.enums.SubscriptionEnum;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SubscriptionDto {
    private UUID subscriptionId;
    private UUID userId;
    private int subscriptionPlanId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    public SubscriptionEnum status;
}
