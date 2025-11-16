package com.finsight.marketrealtime;

import com.finsight.marketrealtime.configurations.AppConf;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(AppConf.class)
@SpringBootApplication
public class MarketRealtimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketRealtimeApplication.class, args);
    }

}
