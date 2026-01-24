package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.SubscriptionDto;
import com.finsight.marketrealtime.enums.RedisEnum;
import com.finsight.marketrealtime.enums.SubscriptionEnum;
import com.finsight.marketrealtime.model.Subscription;
import com.finsight.marketrealtime.model.SubscriptionPlanEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.SubscriptionPlanRepository;
import com.finsight.marketrealtime.repository.SubscriptionRepository;
import com.finsight.marketrealtime.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final RedisDao redisDao;

    @Autowired
    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepository,
                                   LockManager<UUID> lockManager,
                                   UserRepository userRepository,
                                   SubscriptionPlanRepository subscriptionPlanRepository,
                                   RedisDao redisDao
                                   ) {
        this.subscriptionRepository = subscriptionRepository;
        this.lockManager = lockManager;
        this.userRepository = userRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.redisDao = redisDao;
    }

    @Override
    public ResponseDto createSubscription(SubscriptionDto subscriptionDto) {
        Subscription subscription = new Subscription();
        ReentrantLock lock = lockManager.getLock(subscription.getSubscriptionId());
        lock.lock();
        try {
            subscription.setStartDate(subscriptionDto.getStartDate());
            subscription.setEndDate(subscriptionDto.getEndDate());
            subscription.setStatus(SubscriptionEnum.CANCELED);
            UserEntity user;
            SubscriptionPlanEntity subscriptionPlan;
            try {
                user = userRepository
                        .findById(subscriptionDto.getUserId())
                        .orElseThrow();
            } catch (Exception e) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("User not found: "+subscriptionDto.getUserId().toString())
                        .build();
            }
            try {
                subscriptionPlan = subscriptionPlanRepository
                        .findById(subscriptionDto.getSubscriptionPlanId())
                        .orElseThrow();
            } catch (Exception e) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Subscription plan not found")
                        .build();
            }
            subscription.setUser(user);
            subscription.setSubscriptionPlan(subscriptionPlan);
            subscriptionRepository.save(subscription);
            redisDao.save(RedisEnum.SUBSCRIPTION.toString(), subscription.getSubscriptionId(), convertToDto(subscription));
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
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
                        .errorMessage("Subscription not found: "+dto.getSubscriptionId().toString())
                        .build();
            }

            if (dto.getStartDate() != null) subscription.setStartDate(dto.getStartDate());
            if (dto.getEndDate() != null) subscription.setEndDate(dto.getEndDate());
            if (dto.getStatus() != null) subscription.setStatus(dto.getStatus());

            subscriptionRepository.save(subscription);
            redisDao.save(RedisEnum.SUBSCRIPTION.toString(), subscription.getSubscriptionId(), convertToDto(subscription));
            return ResponseDto.builder().success(true).build();

        } finally {
            lock.unlock();
        }
    }

    public ResponseDto deleteSubscription(UUID subscriptionId) {

        ReentrantLock lock = lockManager.getLock(subscriptionId);

        lock.lock();
        try {
            Subscription subscription = subscriptionRepository
                    .findById(subscriptionId)
                    .orElse(null);

            if (subscription == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Subscription not found: "+subscriptionId.toString())
                        .build();
            }
            subscriptionRepository.delete(subscription);
            redisDao.delete(RedisEnum.SUBSCRIPTION.toString(), subscriptionId);
            return ResponseDto.builder().success(true).build();

        } finally {
            lock.unlock();
        }
    }

    private SubscriptionDto convertToDto(Subscription subscription) {
        SubscriptionDto dto = new SubscriptionDto();
        dto.setSubscriptionId(subscription.getSubscriptionId());
        dto.setUserId(subscription.getUser().getUserId());
        dto.setSubscriptionPlanId(subscription.getSubscriptionPlan().getPlanId());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());
        dto.setStatus(subscription.getStatus());
        return dto;
    }
}
