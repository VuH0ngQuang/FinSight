package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.SubscriptionDto;
import com.finsight.marketrealtime.model.Subscription;

import java.util.UUID;

public interface SubscriptionService {

    ResponseDto<Subscription> getSubscriptions(UUID userId);
    ResponseDto updateSubscription(SubscriptionDto subscriptionDto);
}
