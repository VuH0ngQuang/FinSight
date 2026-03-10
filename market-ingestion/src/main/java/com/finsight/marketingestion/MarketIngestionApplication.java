package com.finsight.marketingestion;

import com.finsight.marketingestion.configurations.AppConf;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(AppConf.class)
@SpringBootApplication
public class MarketIngestionApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketIngestionApplication.class, args);
    }

}
