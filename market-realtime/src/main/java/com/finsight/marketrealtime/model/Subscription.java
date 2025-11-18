package com.finsight.marketrealtime.model;

import com.finsight.marketrealtime.enums.SubscriptionEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {
    @Id
    @Builder.Default
    private UUID subscriptionId = UUID.randomUUID();
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    public SubscriptionEnum status;

    @ManyToOne
    private UserEntity user;

    @ManyToOne
    private SubscriptionPlanEntity subscriptionPlan;
}
