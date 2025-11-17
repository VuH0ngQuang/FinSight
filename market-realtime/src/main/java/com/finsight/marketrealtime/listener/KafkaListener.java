package com.finsight.marketrealtime.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.kafka.KafkaService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class KafkaListener extends KafkaService {

    public static final Logger logger = LoggerFactory.getLogger(KafkaListener.class);
    public final AppConf appConf;
    public final ObjectMapper mapper;

    @Autowired
    public KafkaListener(AppConf appConf, ObjectMapper mapper) {
        super(appConf,mapper);
        this.appConf = appConf;
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() {
        createDefaultTopic(appConf.getKafka().getTopic().getMarketData());
        startConsumer(appConf.getKafka().getUrls(), appConf.getKafka().getGroupId(), Collections.singletonList(appConf.getKafka().getTopic().getMarketData()));
    }

    @Override
    protected void handleIncomingMessage(String topic, String key, String payload){
        logger.error("Received Kafka message on topic {}: key={}, payload={}", topic, key, payload);
    }
}
