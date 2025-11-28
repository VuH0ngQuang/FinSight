package com.finsight.marketrealtime;

import com.finsight.marketrealtime.configurations.AppConf;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableConfigurationProperties(AppConf.class)
@EnableScheduling
@SpringBootApplication
public class MarketRealtimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketRealtimeApplication.class, args);
    }

}
