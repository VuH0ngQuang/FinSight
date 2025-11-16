package com.finsight.marketrealtime.listener;

import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.kafka.KafkaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KafkaListener extends KafkaService {

    public static final Logger logger = LoggerFactory.getLogger(KafkaListener.class);
    public final AppConf appConf;

    @Autowired
    public KafkaListener(AppConf appConf) {
        super(appConf);
        this.appConf = appConf;
    }

    
}
