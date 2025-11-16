package com.finsight.collector.producer;

import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.kafka.KafkaService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer extends KafkaService {
    private static final Logger logger = LoggerFactory.getLogger(KafkaProducer.class);
    private final AppConf appConf;

    @Autowired
    public KafkaProducer(AppConf appConf) {
        super(appConf);
        this.appConf = appConf;
    }

    @PostConstruct
    public void init() {
        createDefaultTopic(appConf.getKafka().getTopic().getMarketData());
        connectProducer(appConf.getKafka().getUrls(), appConf.getClusterId());
    }

    public void publish(String payload ) {
        logger.info("Publish Kafka to {}: {}",appConf.getKafka().getTopic().getMarketData(), payload);
        send(appConf.getKafka().getTopic().getMarketData(), payload);
    }

    public void publish(String topic, String payload) {
        logger.info("Publish Kafka to {}: {}",topic, payload);
        send(topic, payload);
    }
}
