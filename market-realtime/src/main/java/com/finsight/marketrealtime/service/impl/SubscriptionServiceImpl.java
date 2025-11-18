package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.SubscriptionDto;
import com.finsight.marketrealtime.model.Subscription;
import com.finsight.marketrealtime.repository.SubscriptionRepository;
import com.finsight.marketrealtime.service.SubscriptionService;

import com.finsight.marketrealtime.utils.LockManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);
    private final SubscriptionRepository subscriptionRepository;
    private final LockManager<UUID> lockManager;

    @Autowired
    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepository, LockManager<UUID> lockManager) {
        this.subscriptionRepository = subscriptionRepository;
        this.lockManager = lockManager;
    }

    public ResponseDto<Subscription> getSubscriptions(UUID userId) {
        return ResponseDto.<Subscription>builder().success(true).data(
                subscriptionRepository.findFirstByUserUserIdOrderByEndDateDesc(userId)
        ).build();
    }

    public ResponseDto updateSubscription(SubscriptionDto dto) {

        ReentrantLock lock = lockManager.getLock(dto.getSubscriptionId());

        lock.lock();
        try {
            Subscription subscription = subscriptionRepository
                    .findById(dto.getSubscriptionId())
                    .orElse(null);

            if (subscription == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Subscription not found")
                        .build();
            }

            if (dto.getStartDate() != null) subscription.setStartDate(dto.getStartDate());
            if (dto.getEndDate() != null) subscription.setEndDate(dto.getEndDate());
            if (dto.getStatus() != null) subscription.setStatus(dto.getStatus());

            subscriptionRepository.save(subscription);

            return ResponseDto.builder().success(true).build();

        } finally {
            lock.unlock();
        }
    }
}
