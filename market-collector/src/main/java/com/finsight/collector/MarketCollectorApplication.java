package com.finsight.collector;

import com.finsight.collector.configurations.AppConf;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableConfigurationProperties(AppConf.class)
@SpringBootApplication
@EnableScheduling
public class MarketCollectorApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketCollectorApplication.class, args);
    }

}
