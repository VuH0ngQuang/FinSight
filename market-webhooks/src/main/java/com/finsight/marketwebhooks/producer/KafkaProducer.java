package com.finsight.marketwebhooks.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketwebhooks.configurations.AppConf;
import com.finsight.marketwebhooks.kafka.KafkaService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer extends KafkaService {
    private static final Logger logger = LoggerFactory.getLogger(KafkaProducer.class);
    private final ObjectMapper mapper;
    private final AppConf appConf;

    @Autowired
    public KafkaProducer(AppConf appConf, ObjectMapper mapper) {
        super(appConf, mapper);
        this.appConf = appConf;
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() {
        createDefaultTopic(appConf.getKafka().getTopic().getMarketWebhooks());
        connectProducer(appConf.getKafka().getUrls(), appConf.getClusterId(), appConf.getKafka().getGroupId());
    }

    public void publish(String message ) {
        String payload = toJson(message, appConf.getUri().getWebhooks().getPayment());
        logger.info("Publish Kafka to {}: {}",appConf.getKafka().getTopic().getMarketWebhooks(), payload);
        send(appConf.getKafka().getTopic().getMarketWebhooks(), payload);
    }

    public void publish(String topic, String message) {
        String payload = toJson(message, "/stock/updateMatchPrice/");
        logger.info("Publish Kafka to {}: {}",topic, payload);
        send(topic, payload);
    }
}
