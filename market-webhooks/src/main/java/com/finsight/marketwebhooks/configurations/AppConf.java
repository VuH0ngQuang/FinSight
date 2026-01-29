package com.finsight.marketwebhooks.configurations;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.slf4j.Logger;
import org.springframework.boot.context.properties.ConfigurationProperties;


@Data
@ConfigurationProperties(prefix = "app")
public class AppConf {
    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(AppConf.class);
    private String clusterId;
    private Uri uri;
    private Kafka kafka;

    @PostConstruct
    private void init() {
        logger.info("===== Application Configuration =====");
        logger.info("Cluster ID            : {}", clusterId);
        if (kafka != null) {
            logger.info("Kafka URLs            : {}", kafka.getUrls());
            logger.info("Kafka Topic           : {}", kafka.getTopic().getMarketWebhooks());
            logger.info("Kafka GroupId         : {}", kafka.getGroupId());
        }
        if (uri != null) {
            logger.info("Webhooks Payment      : {}", uri.getWebhooks().getPayment());
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
        private Webhooks webhooks;
    }

    @Data
    public static class Webhooks {
        private String payment;
    }

    @Data
    public static class KafkaTopic {
        private String marketWebhooks;
    }
}
