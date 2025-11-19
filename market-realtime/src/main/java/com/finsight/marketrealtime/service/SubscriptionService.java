package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.SubscriptionDto;

import java.util.UUID;

public interface SubscriptionService {
    ResponseDto createSubscription(SubscriptionDto subscriptionDto);
    ResponseDto updateSubscription(SubscriptionDto subscriptionDto);
    ResponseDto deleteSubscription(UUID subscriptionId);
}
