package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.SubscriptionPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, Integer> {
}
