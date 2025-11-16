package com.finsight.collector.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.kafka.KafkaService;
import com.finsight.collector.model.Message;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

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
        createDefaultTopic(appConf.getKafka().getTopic().getMarketData());
        connectProducer(appConf.getKafka().getUrls(), appConf.getClusterId());
    }

    public void publish(String message ) {
        String payload = toJson(message, "market/stock/updateMatchPrice");
        logger.info("Publish Kafka to {}: {}",appConf.getKafka().getTopic().getMarketData(), payload);
        send(appConf.getKafka().getTopic().getMarketData(), payload);
    }

    public void publish(String topic, String message) {
        String payload = toJson(message, "market/stock/updateMatchPrice");
        logger.info("Publish Kafka to {}: {}",topic, payload);
        send(topic, payload);
    }
}
