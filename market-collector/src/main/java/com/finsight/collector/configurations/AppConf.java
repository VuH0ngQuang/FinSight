package com.finsight.collector.configurations;

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
    private DataFeed dataFeed;
    private Database database;

    @PostConstruct
    public void logConfig() {
        logger.info("===== Application Configuration =====");
        logger.info("Cluster ID           : {}", clusterId);
        if (kafka != null) {
            logger.info("Kafka URLs           : {}", kafka.getUrls());
            logger.info("Kafka Topic          : {}", kafka.getTopic() != null ? kafka.getTopic().getMarketData() : "(none)");
        }
        if (mqtt != null) {
            logger.info("MQTT URL             : {}", mqtt.getUrl());
            logger.info("MQTT Topic           : {}", mqtt.getTopic() != null ? mqtt.getTopic().getMarketData() : "(none)");
            logger.info("MQTT username        : {}", mqtt.getUsername());
            logger.info("MQTT password        : {}", mqtt.getPassword());
        }
        if (dataFeed != null) {
            logger.info("DataFeed TokenURL    : {}", dataFeed.getTokenUrl());
            logger.info("DataFeed InvestorURL : {}", dataFeed.getInvestorUrl());
            logger.info("DataFeed WebSocketURL: {}", dataFeed.getWebsocketUrl());
            logger.info("DataFeed username    : {}", dataFeed.getUsername());
            logger.info("DataFeed password    : {}", dataFeed.getPassword());
        }

        if (database != null) {
            logger.info("Database URL         : {}", database.getUrl());
            logger.info("Database username    : {}", database.getUsername());
            logger.info("Database password    : {}", database.getPassword());
        }

        logger.info("=====================================");
    }

    @Data
    public static  class Kafka {
        private String urls;
        private Integer timeout = 15000;
        private KafkaTopic topic;
        private String groupId;
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
    public static  class MqttTopic {
        private String marketData;
    }

    @Data
    public static class DataFeed {
        private String tokenUrl;
        private String investorUrl;
        private String websocketUrl;
        private String username;
        private String password;

    }

    @Data
    public static class Database {
        private String url;
        private String username;
        private String password;
    }
}
