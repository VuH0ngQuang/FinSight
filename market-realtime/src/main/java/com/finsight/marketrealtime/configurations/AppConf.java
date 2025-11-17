package com.finsight.marketrealtime.configurations;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app")
public class AppConf {
    private static final Logger logger = LoggerFactory.getLogger(AppConf.class);
    private String clusterId;
    private Kafka kafka;
    private Mqtt mqtt;
    private Database database;

    @PostConstruct
    public void logConfig() {
        logger.info("===== Application Configuration =====");
        logger.info("Cluster ID           : {}", clusterId);
        if (kafka != null) {
            logger.info("Kafka URLs           : {}", kafka.getUrls());
            logger.info("Kafka Topic          : {}", kafka.getTopic() != null ? kafka.getTopic().getMarketData() : "(none)");
            logger.info("Kafka GroupId        : {}", kafka.getGroupId());
        }
        if (mqtt != null) {
            logger.info("MQTT URL             : {}", mqtt.getUrl());
            logger.info("MQTT Topic           : {}", mqtt.getTopic() != null ? mqtt.getTopic().getMarketData() : "(none)");
            logger.info("MQTT username        : {}", mqtt.getUsername());
            logger.info("MQTT password        : {}", mqtt.getPassword());
        }
        if (database != null) {
            logger.info("Database URL         : {}", database.getUrl());
            logger.info("Database username    : {}", database.getUsername());
            logger.info("Database password    : {}", database.getPassword());
        }
    }

    @Data
    public static  class Kafka {
        private String urls;
        private Integer timeout = 15000;
        private String groupId;
        private KafkaTopic topic;
    }

    @Data
    public static  class KafkaTopic {
        private String marketData;
    }

    @Data
    public static  class Mqtt {
        private String url;
        private String username;
        private String password;
        private MqttTopic topic;
    }

    @Data
    public static class MqttTopic {
        private String marketData;
    }

    @Data
    public static class Database {
        private String url;
        private String username;
        private String password;
    }
}

