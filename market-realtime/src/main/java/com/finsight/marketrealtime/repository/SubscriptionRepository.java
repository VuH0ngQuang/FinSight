package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository <Subscription, UUID> {
    Subscription findFirstByUserUserIdOrderByEndDateDesc(UUID userId);
}
