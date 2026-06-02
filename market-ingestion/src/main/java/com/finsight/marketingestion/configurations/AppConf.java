package com.finsight.marketingestion.configurations;

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
    private Uri uri;
    private Kafka kafka;
    private Redis redis;

    @PostConstruct
    public void logConfig() {
        logger.info("===== Application Configuration =====");
        logger.info("Cluster ID           : {}", clusterId);
        if (kafka != null) {
            logger.info("Kafka URLs           : {}", kafka.getUrls());
            logger.info("Kafka Topic          : {}", kafka.getTopic() != null ? kafka.getTopic().getMarketIngestion() : "(none)");
        }

        if (redis != null) {
            logger.info("Redis HOST           : {}", redis.getHost());
            logger.info("Redis port           : {}", redis.getPort());
            logger.info("Redis password       : {}", redis.getPassword());
            logger.info("Redis database       : {}", redis.getDatabase());
        }

        if (uri != null) {
            logger.info("StockYearData Update      : {}", uri.getStockYearData().getUpdate());
        }

        logger.info("=====================================");
    }

    @Data
    public static class Kafka {
        private String urls;
        private Integer timeout = 15000;
        private String groupId;
        private KafkaTopic topic;
    }

    @Data
    public static class Uri {
        private StockYearData stockYearData;
    }

    @Data
    public static class Redis {
        private String host;
        private int port;
        private String password;
        private int database;
    }

    @Data
    public static class StockYearData {
        private String update;
        private String validationHistory;
    }

    @Data
    public static class KafkaTopic {
        private String marketIngestion;
        private String marketIngestionReply;
    }
}
