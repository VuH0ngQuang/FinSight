package com.finsight.marketrealtime.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
public class PayOSConf {
    private final AppConf appConf;

    @Autowired
    public PayOSConf(AppConf appConf) {
        this.appConf = appConf;
    }

    @Bean
    public PayOS payOS() {
        return new PayOS(
                appConf.getPayOSEnv().getClientID(),
                appConf.getPayOSEnv().getApiKey(),
                appConf.getPayOSEnv().getChecksumKey()
        );
    }

}
