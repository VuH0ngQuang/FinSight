package com.finsight.collector.producer;

import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.mqtt.MqttService;
import jakarta.annotation.PostConstruct;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MqttProducer extends MqttService {
    private static final Logger logger = LoggerFactory.getLogger(MqttProducer.class);
    private final AppConf appConf;

    @Autowired
    public MqttProducer(AppConf appConf) throws MqttException {
        super(appConf);
        this.appConf = appConf;
    }

    @PostConstruct
    public void init() {
        try {
            initConnection();
        } catch (IOException e) {
            logger.error("Error while initializing MQTT producer: {}",e.getMessage());
        }
    }

    public void initConnection() throws IOException {
        createDefaultTopic(appConf.getMqtt().getTopic().getMarketData());
        connect(appConf.getMqtt().getUrl(),appConf.getClusterId(),
                appConf.getMqtt().getUsername(), appConf.getMqtt().getPassword());
    }

    @Override
    public void connectionLost(Throwable cause) {
        try {
            initConnection();
        } catch (IOException e) {
            logger.error("Error while initializing MQTT producer: {}",e.getMessage());
        }
    }

    public void publish(String payload ) {
        logger.info("Publish MQTT to {}: {}",appConf.getMqtt().getTopic().getMarketData(), payload);
        try {
            send(appConf.getMqtt().getTopic().getMarketData(), payload);
        } catch (Exception e) {
            send(appConf.getMqtt().getTopic().getMarketData(), payload);
            logger.error("Error while sending message MQTT producer: {}", e.getMessage());
        }
    }

    public void publish(String topic, String payload) {
        logger.info("Publish MQTT to {}: {}",topic, payload);
        send(topic, payload);
    }
}
