package com.finsight.marketrealtime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Builder
@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionPlanEntity {
    @Id
    private int planId;
    private String planName;
    private BigDecimal price;
    @Enumerated(EnumType.STRING)
    private BillingCycle billingCycle;

    @OneToMany(mappedBy = "subscriptionPlan")
    private List<Subscription> subscriptions;

    private enum BillingCycle { MONTHLY, YEARLY }
}
