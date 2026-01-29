package com.finsight.marketrealtime.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.kafka.KafkaService;
import com.finsight.marketrealtime.model.Message;
import com.finsight.marketrealtime.service.MessageRouterService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
public class KafkaListener extends KafkaService {

    public static final Logger logger = LoggerFactory.getLogger(KafkaListener.class);
    public final AppConf appConf;
    public final ObjectMapper mapper;
    private final MessageRouterService messageRouterService;

    @Autowired
    public KafkaListener(AppConf appConf, ObjectMapper mapper, MessageRouterService messageRouterService) {
        super(appConf, mapper);
        this.appConf = appConf;
        this.mapper = mapper;
        this.messageRouterService = messageRouterService;
    }

    @PostConstruct
    public void init() {
        createDefaultTopic(appConf.getKafka().getTopic().getMarketData());
        List<String> topics = new ArrayList<>();
        topics.add(appConf.getKafka().getTopic().getMarketData());
        topics.add(appConf.getKafka().getTopic().getMarketRest());
        topics.add(appConf.getKafka().getTopic().getMarketWebhooks());

        // Initialize producer to send responses
        connectProducer(
            appConf.getKafka().getUrls(), 
            appConf.getClusterId(),
            appConf.getKafka().getGroupId()
        );
        startConsumer(appConf.getKafka().getUrls(), appConf.getKafka().getGroupId(), topics);
    }

    @Override
    protected void handleIncomingMessage(String topic, String key, String payload){
        logger.info("Received Kafka message on topic {}: key={}, payload={}", topic, key, payload);
        
        try {
            // Parse the JSON payload into a Message object
            Message message = mapper.readValue(payload, Message.class);
            
            // Route the message and get the ResponseDto
            var responseDto = messageRouterService.routeMessage(message);
            
            // Send response back to the source topic with the same key
            if (responseDto != null && message.getSourceId() != null) {
                sendResponse(message.getSourceId(), key, responseDto, message.getUri());
            }
        } catch (Exception e) {
            logger.error("Error processing Kafka message: {}", e.getMessage(), e);
        }
    }
}
