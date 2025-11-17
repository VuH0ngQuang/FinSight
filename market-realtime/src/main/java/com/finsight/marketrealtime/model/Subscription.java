package com.finsight.marketrealtime.model;

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
    @EmbeddedId
    private SubscriptionKey subscriptionId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private enum status { ACTIVE, EXPIRED, CANCELED }

    @ManyToOne
    private UserEntity user;

    @ManyToOne
    private SubscriptionPlanEntity subscriptionPlan;


    @Data
    @Embeddable
    public static class SubscriptionKey {
        private UUID userId;
        private int planId;
    }
}
