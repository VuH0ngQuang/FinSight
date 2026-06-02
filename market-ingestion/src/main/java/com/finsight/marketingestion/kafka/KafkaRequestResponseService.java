package com.finsight.marketingestion.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.finsight.marketingestion.configurations.AppConf;
import com.finsight.marketingestion.dto.ResponseDto;
import com.finsight.marketingestion.dto.StockYearDataHistoryRequestDto;
import com.finsight.marketingestion.dto.StockYearDataHistoryResponseDto;
import com.finsight.marketingestion.model.Message;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

@Service
public class KafkaRequestResponseService extends KafkaService {
    private static final Logger logger = LoggerFactory.getLogger(KafkaRequestResponseService.class);

    private final AppConf appConf;
    private final ObjectMapper mapper;
    private final ConcurrentMap<String, CompletableFuture<Message>> pendingResponses = new ConcurrentHashMap<>();
    private String replyTopic;

    public KafkaRequestResponseService(AppConf appConf, ObjectMapper mapper) {
        super(appConf, mapper);
        this.appConf = appConf;
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() {
        replyTopic = resolveReplyTopic();
        String replyGroupId = appConf.getKafka().getGroupId() + "-reply-" + replyTopic;

        connectProducer(appConf.getKafka().getUrls(), appConf.getClusterId() + "-request-response", replyGroupId);
        startConsumer(appConf.getKafka().getUrls(), replyGroupId, Collections.singletonList(replyTopic));
        logger.info("Kafka request-response initialized with reply topic {}", replyTopic);
    }

    public Message sendAndWait(String uri, Object payload) {
        String correlationKey = UUID.randomUUID().toString();
        CompletableFuture<Message> responseFuture = new CompletableFuture<>();
        pendingResponses.put(correlationKey, responseFuture);

        try {
            String request = toJson(payload, uri, replyTopic);
            send(appConf.getKafka().getTopic().getMarketIngestion(), correlationKey, request);
            return responseFuture.get(appConf.getKafka().getTimeout(), TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            throw new RuntimeException("Kafka response timed out for key " + correlationKey, e);
        } finally {
            pendingResponses.remove(correlationKey);
        }
    }

    public ResponseDto<List<StockYearDataHistoryResponseDto>> getStockYearDataValidationHistory(
            List<StockYearDataHistoryRequestDto> requests
    ) {
        Message response = sendAndWait(appConf.getUri().getStockYearData().getValidationHistory(), requests);
        return mapper.convertValue(
                response.getPayload(),
                new TypeReference<ResponseDto<List<StockYearDataHistoryResponseDto>>>() {}
        );
    }

    @Override
    protected void handleIncomingMessage(String topic, String key, String payload) {
        if (key == null) {
            return;
        }

        CompletableFuture<Message> responseFuture = pendingResponses.get(key);
        if (responseFuture == null) {
            return;
        }

        try {
            responseFuture.complete(mapper.readValue(payload, Message.class));
        } catch (Exception e) {
            responseFuture.completeExceptionally(e);
        }
    }

    private String resolveReplyTopic() {
        String configuredReplyTopic = appConf.getKafka().getTopic().getMarketIngestionReply();
        if (configuredReplyTopic != null && !configuredReplyTopic.isBlank()) {
            return configuredReplyTopic;
        }
        return appConf.getClusterId();
    }
}
