package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.PaymentDto;
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
import com.finsight.marketrealtime.service.PaymentService;
import com.finsight.marketrealtime.service.SubscriptionService;

import com.finsight.marketrealtime.utils.LockManager;
import com.finsight.marketrealtime.utils.IDGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionServiceImpl.class);
    private final SubscriptionRepository subscriptionRepository;
    private final LockManager<Long> lockManager;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final RedisDao redisDao;
    private final PaymentService paymentService;

    @Autowired
    public SubscriptionServiceImpl(SubscriptionRepository subscriptionRepository,
                                   LockManager<Long> lockManager,
                                   UserRepository userRepository,
                                   SubscriptionPlanRepository subscriptionPlanRepository,
                                   RedisDao redisDao,
                                   PaymentService paymentService
                                   ) {
        this.subscriptionRepository = subscriptionRepository;
        this.lockManager = lockManager;
        this.userRepository = userRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.redisDao = redisDao;
        this.paymentService = paymentService;
    }

    @Override
    public ResponseDto<String> createSubscription(SubscriptionDto subscriptionDto) {
        Subscription subscription = new Subscription();
        long subscriptionId = IDGenerator.nextId();
        ReentrantLock lock = lockManager.getLock(subscriptionId);
        lock.lock();
        try {
            subscription.setSubscriptionId(subscriptionId);
            subscription.setStartDate(LocalDateTime.now());
            if (subscriptionDto.getType().equals("1Y")) {
                subscription.setEndDate(subscription.getStartDate().plusYears(1));
            } else {
                subscription.setEndDate(subscription.getStartDate().plusMonths(1));
            }
            subscription.setStatus(SubscriptionEnum.UNPAID);
            subscription.setErrorMessage(null);
            UserEntity user;
            SubscriptionPlanEntity subscriptionPlan;
            try {
                user = userRepository
                        .findById(subscriptionDto.getUserId())
                        .orElseThrow();
            } catch (Exception e) {
                return ResponseDto.<String>builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("User not found: "+subscriptionDto.getUserId())
                        .data(null)
                        .build();
            }
            try {
                subscriptionPlan = subscriptionPlanRepository
                        .findById(subscriptionDto.getSubscriptionPlanId())
                        .orElseThrow();
            } catch (Exception e) {
                return ResponseDto.<String>builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Subscription plan not found")
                        .data(null)
                        .build();
            }
            subscription.setUser(user);
            subscription.setSubscriptionPlan(subscriptionPlan);
            subscriptionRepository.save(subscription);
            redisDao.save(RedisEnum.SUBSCRIPTION.toString(), subscription.getSubscriptionId(), convertToDto(subscription));
            String ref = String.format("%08d", subscriptionId % 100000000);
            String checkoutUrl = paymentService.createPayment(subscriptionId, ref, subscriptionPlan.getPrice().longValueExact());
            return ResponseDto.<String>builder().success(true).data(checkoutUrl).build();
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
                        .errorMessage("Subscription not found: "+ dto.getSubscriptionId())
                        .build();
            }

            if (dto.getStartDate() != null) subscription.setStartDate(dto.getStartDate());
            if (dto.getEndDate() != null) subscription.setEndDate(dto.getEndDate());
            if (dto.getStatus() != null) subscription.setStatus(dto.getStatus());
            if (dto.getErrorMessage() != null) subscription.setErrorMessage(dto.getErrorMessage());

            subscriptionRepository.save(subscription);
            redisDao.save(RedisEnum.SUBSCRIPTION.toString(), subscription.getSubscriptionId(), convertToDto(subscription));

            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    public ResponseDto deleteSubscription(long subscriptionId) {

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
                        .errorMessage("Subscription not found: "+subscriptionId)
                        .build();
            }
            subscriptionRepository.delete(subscription);
            redisDao.delete(RedisEnum.SUBSCRIPTION.toString(), subscriptionId);
            return ResponseDto.builder().success(true).build();

        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto paymentSubscription(PaymentDto paymentDto) {

        ReentrantLock lock = lockManager.getLock(paymentDto.getId());

        lock.lock();
        try {
            Subscription subscription = subscriptionRepository
                    .findById(paymentDto.getId())
                    .orElse(null);

            if (subscription == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Subscription not found: "+ paymentDto.getId())
                        .build();
            }

            if (paymentDto.isSuccess()) {
                subscription.setStatus(SubscriptionEnum.ACTIVE);
                subscription.setErrorMessage(null);
            } else {
                subscription.setStatus(SubscriptionEnum.ERROR);
                subscription.setErrorMessage(paymentDto.getErrorMessage());
            }

            subscriptionRepository.save(subscription);
            redisDao.save(RedisEnum.SUBSCRIPTION.toString(), subscription.getSubscriptionId(), convertToDto(subscription));

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
        dto.setErrorMessage(subscription.getErrorMessage());
        return dto;
    }
}
