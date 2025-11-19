package com.finsight.collector.listener;

import com.finsight.collector.auth.TokenClient;
import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.mqtt.MqttService;
import com.finsight.collector.producer.KafkaProducer;
import com.finsight.collector.producer.MqttProducer;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MqttListener extends MqttService {

    public static final Logger logger = LoggerFactory.getLogger(MqttListener.class);
    public final AppConf appConf;
    public final TokenClient tokenClient;
    public final KafkaProducer kafkaProducer;
    public final MqttProducer mqttProducer;

    @Autowired
    public MqttListener(AppConf appConf, TokenClient tokenClient, KafkaProducer kafkaProducer, MqttProducer mqttProducer) {
        super(appConf);
        this.appConf = appConf;
        this.tokenClient = tokenClient;
        this.kafkaProducer = kafkaProducer;
        this.mqttProducer = mqttProducer;
    }

    @PostConstruct
    public void init() throws IOException {
        String password = tokenClient.getToken();
        String username = tokenClient.getInvestorId(password);
        connect(appConf.getDataFeed().getWebsocketUrl(),
                "<dnse-price-json-mqtt-ws-sub>-<>-<"+appConf.getClusterId()+">",
                username,
                password);
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/ACB");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/VIX");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/SHB");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/HPG");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/NVL");
    }

    @Override
    public void connectionLost(Throwable cause) {
        try {
            init();
        } catch (IOException e) {
            logger.error("Error while initializing MQTT listener: {}",e.getMessage());
        }
    }

    @Override
    protected void handleIncomingMessage(String topic, String message) {
        logger.info("Received MQTT message on topic {}: {}", topic, message);
        kafkaProducer.publish(message);
        mqttProducer.publish(message);
    }
}
