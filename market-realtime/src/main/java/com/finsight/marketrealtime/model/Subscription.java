package com.finsight.marketrealtime.model;

import com.finsight.marketrealtime.enums.SubscriptionEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    private Long subscriptionId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String errorMessage;
    @Enumerated(EnumType.STRING)
    public SubscriptionEnum status;


    @ManyToOne
    private UserEntity user;

    @ManyToOne
    private SubscriptionPlanEntity subscriptionPlan;
}
