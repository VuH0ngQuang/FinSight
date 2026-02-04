package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.PaymentDto;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.SubscriptionDto;

import java.util.UUID;

public interface SubscriptionService {
    ResponseDto<String> createSubscription(SubscriptionDto subscriptionDto);
    ResponseDto updateSubscription(SubscriptionDto subscriptionDto);
    ResponseDto deleteSubscription(long subscriptionId);
    ResponseDto paymentSubscription(PaymentDto paymentDto);
}
