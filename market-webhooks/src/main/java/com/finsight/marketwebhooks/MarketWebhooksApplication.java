package com.finsight.marketwebhooks;

import com.finsight.marketwebhooks.configurations.AppConf;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties(AppConf.class)
@SpringBootApplication
public class MarketWebhooksApplication {
	public static void main(String[] args) {
		SpringApplication.run(MarketWebhooksApplication.class, args);
	}

}
