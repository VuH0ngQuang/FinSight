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

    @PostConstruct
    public void logConfig() {
        logger.info("===== Application Configuration =====");
        logger.info("Cluster ID           : {}", clusterId);
        if (kafka != null) {
            logger.info("Kafka URLs           : {}", kafka.getUrls());
            logger.info("Kafka Topic          : {}", kafka.getTopic() != null ? kafka.getTopic().getMarketIngestion() : "(none)");
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
    public static class StockYearData {
        private String update;
    }

    @Data
    public static class KafkaTopic {
        private String marketIngestion;
    }
}
