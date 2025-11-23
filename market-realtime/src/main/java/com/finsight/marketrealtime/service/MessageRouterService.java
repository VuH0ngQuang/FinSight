package com.finsight.marketrealtime.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.dto.*;
import com.finsight.marketrealtime.model.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import com.finsight.marketrealtime.dto.ResponseDto;

@Service
public class MessageRouterService {
    private static final Logger logger = LoggerFactory.getLogger(MessageRouterService.class);
    
    private final ObjectMapper mapper;
    private final UserService userService;
    private final StockService stockService;
    private final SubscriptionService subscriptionService;
    private final AhpConfigService ahpConfigService;
    private final AppConf appConf;

    @Autowired
    public MessageRouterService(
            ObjectMapper mapper,
            UserService userService,
            StockService stockService,
            SubscriptionService subscriptionService,
            AhpConfigService ahpConfigService,
            AppConf appConf) {
        this.mapper = mapper;
        this.userService = userService;
        this.stockService = stockService;
        this.subscriptionService = subscriptionService;
        this.ahpConfigService = ahpConfigService;
        this.appConf = appConf;
    }

    /**
     * Helper method to properly deserialize payload to DTO
     * Handles both Map (from JSON deserialization) and String cases
     */
    private <T> T mapPayloadToDto(Object payload, Class<T> dtoClass) {
        try {
            if (payload == null) {
                return null;
            }
            
            // If payload is already the correct type, return it
            if (dtoClass.isInstance(payload)) {
                return dtoClass.cast(payload);
            }
            
            // If payload is a String, parse it as JSON
            if (payload instanceof String) {
                return mapper.readValue((String) payload, dtoClass);
            }
            
            // Otherwise, convert from Map/Object
            return mapper.convertValue(payload, dtoClass);
        } catch (Exception e) {
            logger.error("Error mapping payload to {}: {}", dtoClass.getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("Failed to map payload to " + dtoClass.getSimpleName(), e);
        }
    }

    public ResponseDto routeMessage(Message message) {
        if (message == null || message.getUri() == null) {
            logger.error("Message or URI is null, cannot route");
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(400)
                    .errorMessage("Message or URI is null")
                    .build();
        }

        String uri = message.getUri();
        Object payload = message.getPayload();

        try {
            logger.info("Routing message with URI: {}", uri);

            // User service routes
            if (uri.startsWith("/user")) {
                UserDto userDto = mapPayloadToDto(payload, UserDto.class);
                return routeUserMessage(uri, userDto);
            }
            // Stock service routes
            else if (uri.startsWith("/stock")) {
                StockDto stockDto = mapPayloadToDto(payload, StockDto.class);
                return routeStockMessage(uri, stockDto);
            }
            // Subscription service routes
            else if (uri.startsWith("/subscription")) {
                SubscriptionDto subscriptionDto = mapPayloadToDto(payload, SubscriptionDto.class);
                return routeSubscriptionMessage(uri, subscriptionDto);
            }
            // AHP Config service routes
            else if (uri.startsWith("/ahpConfig")) {
                AhpConfigDto ahpConfigDto = mapPayloadToDto(payload, AhpConfigDto.class);
                return routeAhpConfigMessage(uri, ahpConfigDto);
            }
            else {
                logger.warn("Unknown URI pattern: {}", uri);
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Unknown URI pattern: " + uri)
                        .build();
            }
        } catch (Exception e) {
            logger.error("Error routing message with URI {}: {}", uri, e.getMessage(), e);
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(500)
                    .errorMessage("Error processing message: " + e.getMessage())
                    .build();
        }
    }

    private ResponseDto routeUserMessage(String uri, UserDto payload) {
        try {
            if (uri.equals(appConf.getUri().getUser().getCreate())) {
                return userService.createUser(payload);
            }
            else if (uri.equals(appConf.getUri().getUser().getUpdate())) {
                return userService.updateUser(payload);
            }
            else if (uri.startsWith(appConf.getUri().getUser().getDelete())) {
                if (payload == null || payload.getUserId() == null) {
                    logger.warn("User ID is required for delete operation");
                    return ResponseDto.builder()
                            .success(false)
                            .errorCode(400)
                            .errorMessage("User ID is required for delete operation")
                            .build();
                }
                return userService.deleteUser(payload.getUserId());
            }
            else if (uri.startsWith(appConf.getUri().getUser().getUpdatePassword())) {
                if (payload != null) {
                    return userService.updatePassword(payload);
                } else {
                    logger.warn("User DTO is required for updatePassword operation");
                    return ResponseDto.builder()
                            .success(false)
                            .errorCode(404)
                            .errorMessage("User DTO is required for updatePassword operation")
                            .build();
                }
            }
            else {
                logger.warn("Unknown user URI: {}", uri);
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Unknown user URI: " + uri)
                        .build();
            }
        } catch (Exception e) {
            logger.error("Error processing user message with URI {}: {}", uri, e.getMessage(), e);
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(500)
                    .errorMessage("Error processing user message: " + e.getMessage())
                    .build();
        }
    }

    private ResponseDto routeStockMessage(String uri, StockDto payload) {
        try {
            if (uri.equals(appConf.getUri().getStock().getCreate())) {
                return stockService.createStock(payload);
            }
            else if (uri.equals(appConf.getUri().getStock().getUpdate())) {
                return stockService.updateStock(payload);
            }
            else if (uri.equals(appConf.getUri().getStock().getDelete())) {
                return stockService.deleteStock(payload);
            }
            else if (uri.equals(appConf.getUri().getStock().getUpdateIndustryRatios())) {
                return stockService.updateIndustryRatios(payload);
            }
            else if (uri.startsWith(appConf.getUri().getStock().getUpdateYearData()+"/")) {
                // Format: /stock/updateYearData/{year}
                String[] parts = uri.substring("/stock/updateYearData/".length()).split("/");
                if (parts.length == 2) {
                    int year = Integer.parseInt(parts[0]);
                    StockYearDataDto stockYearDataDto = mapPayloadToDto(payload.getStockYearData(), StockYearDataDto.class);
                    return stockService.updateStockYearData(stockYearDataDto, year, payload.getStockId());
                } else {
                    logger.warn("Invalid URI format for updateYearData: {}", uri);
                    return ResponseDto.builder()
                            .success(false)
                            .errorCode(400)
                            .errorMessage("Invalid URI format for updateYearData. Expected: /stock/updateYearData/{year}")
                            .build();
                }
            }
            else if (uri.startsWith("/stock/updateMatchPrice")) {
                stockService.updateMatchPrice(payload.getStockId(), payload.getMatchPrice());
                return ResponseDto.builder()
                        .success(true)
                        .build();
            }
            else {
                logger.warn("Unknown stock URI: {}", uri);
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Unknown stock URI: " + uri)
                        .build();
            }
        } catch (Exception e) {
            logger.error("Error processing stock message with URI {}: {}", uri, e.getMessage(), e);
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(500)
                    .errorMessage("Error processing stock message: " + e.getMessage())
                    .build();
        }
    }

    private ResponseDto routeSubscriptionMessage(String uri, SubscriptionDto payload) {
        try {
            if (uri.equals(appConf.getUri().getSubscription().getCreate())) {
                return subscriptionService.createSubscription(payload);
            }
            else if (uri.equals(appConf.getUri().getSubscription().getUpdate())) {
                return subscriptionService.updateSubscription(payload);
            }
            else if (uri.startsWith(appConf.getUri().getSubscription().getDelete())) {
                return subscriptionService.deleteSubscription(payload.getSubscriptionId());
            }
            else {
                logger.warn("Unknown subscription URI: {}", uri);
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Unknown subscription URI: " + uri)
                        .build();
            }
        } catch (Exception e) {
            logger.error("Error processing subscription message with URI {}: {}", uri, e.getMessage(), e);
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(500)
                    .errorMessage("Error processing subscription message: " + e.getMessage())
                    .build();
        }
    }

    private ResponseDto routeAhpConfigMessage(String uri, AhpConfigDto payload) {
        try {
            if (uri.equals(appConf.getUri().getAhpConfig().getCreate())) {
                return ahpConfigService.createAhpConfig(payload);
            }
            else if (uri.equals(appConf.getUri().getAhpConfig().getUpdate())) {
                return ahpConfigService.updateAhpConfig(payload);
            }
            else {
                logger.warn("Unknown AHP config URI: {}", uri);
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Unknown AHP config URI: " + uri)
                        .build();
            }
        } catch (Exception e) {
            logger.error("Error processing AHP config message with URI {}: {}", uri, e.getMessage(), e);
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(500)
                    .errorMessage("Error processing AHP config message: " + e.getMessage())
                    .build();
        }
    }
}
