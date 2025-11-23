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
    private Database database;
    private Uri uri;

    @PostConstruct
    public void logConfig() {
        logger.info("===== Application Configuration =====");
        logger.info("Cluster ID            : {}", clusterId);
        if (kafka != null) {
            logger.info("Kafka URLs            : {}", kafka.getUrls());
            logger.info("Kafka Topic           : {}", kafka.getTopic() != null ? kafka.getTopic().getMarketData() : "(none)");
            logger.info("Kafka GroupId         : {}", kafka.getGroupId());
        }
        if (database != null) {
            logger.info("Database URL          : {}", database.getUrl());
            logger.info("Database username     : {}", database.getUsername());
            logger.info("Database password     : {}", database.getPassword());
        }

        if (uri != null) {
            logger.info("User Create URI       : {}", uri.getUser().getCreate());
            logger.info("User Update URI       : {}", uri.getUser().getUpdate());
            logger.info("User Delete URI       : {}", uri.getUser().getDelete());
            logger.info("User UpdatePassword   : {}", uri.getUser().getUpdatePassword());

            logger.info("Stock Create URI      : {}", uri.getStock().getCreate());
            logger.info("Stock Update URI      : {}", uri.getStock().getUpdate());
            logger.info("Stock Delete URI      : {}", uri.getStock().getDelete());
            logger.info("Stock UpdateIndustry  : {}", uri.getStock().getUpdateIndustryRatios());
            logger.info("Stock UpdateYearData  : {}", uri.getStock().getUpdateYearData());
            logger.info("Stock UpdateMatchPrice: {}", uri.getStock().getUpdateMatchPrice());

            logger.info("Subscription Create   : {}", uri.getSubscription().getCreate());
            logger.info("Subscription Update   : {}", uri.getSubscription().getUpdate());
            logger.info("Subscription Delete   : {}", uri.getSubscription().getDelete());

            logger.info("AHP Config Create     : {}", uri.getAhpConfig().getCreate());
            logger.info("AHP Config Update     : {}", uri.getAhpConfig().getUpdate());
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
    public static class KafkaTopic {
        private String marketData;
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

    @Data
    public static class Uri {
        private User user;
        private Stock stock;
        private Subscription subscription;
        private AhpConfig ahpConfig;
    }

    @Data
    public static class User {
        private String create;
        private String update;
        private String delete;
        private String updatePassword;
    }

    @Data
    public static class Stock {
        private String create;
        private String update;
        private String delete;
        private String updateIndustryRatios;
        private String updateYearData;
        private String updateMatchPrice;
    }

    @Data
    public static class Subscription {
        private String create;
        private String update;
        private String delete;
    }

    @Data
    public static class AhpConfig {
        private String create;
        private String update;
    }
}

