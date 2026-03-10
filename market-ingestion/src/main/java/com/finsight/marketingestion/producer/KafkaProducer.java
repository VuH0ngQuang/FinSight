package com.finsight.marketingestion.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketingestion.configurations.AppConf;
import com.finsight.marketingestion.kafka.KafkaService;
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
        createDefaultTopic(appConf.getKafka().getTopic().getMarketIngestion());
        connectProducer(appConf.getKafka().getUrls(), appConf.getClusterId(), appConf.getKafka().getGroupId());
    }

    public void publish(String message) {
        String payload = toJson(message, appConf.getUri().getStockYearData().getUpdate());
        logger.info("Publish Kafka to {}: {}",appConf.getKafka().getTopic().getMarketIngestion(), payload);
        send(appConf.getKafka().getTopic().getMarketIngestion(), payload);
    }

    public void publish(String message, String uri) {
        String payload = toJson(message, uri);
        logger.info("Publish Kafka to {}: {}",appConf.getKafka().getTopic().getMarketIngestion(), payload);
        send(appConf.getKafka().getTopic().getMarketIngestion(), payload);
    }
}

