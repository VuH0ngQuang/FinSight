package com.finsight.collector.producer;

import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.mqtt.MqttService;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MqttProducer extends MqttService {
    private static final Logger logger = LoggerFactory.getLogger(MqttProducer.class);
    private final AppConf appConf;

    @Autowired
    public MqttProducer(AppConf appConf) throws MqttException {
        super(appConf);
        this.appConf = appConf;
        start();
        publish("MQTT is up and running!\n");
    }

    public void start() throws MqttException {
        createDefaultTopic(appConf.getMqtt().getTopic().getMarketData());
        connect(appConf.getMqtt().getUrl(),appConf.getClusterId(),
                appConf.getMqtt().getUsername(), appConf.getMqtt().getPassword());
    }

    public void publish(String payload ) {
        send(appConf.getMqtt().getTopic().getMarketData(), payload);
    }

    public void publish(String topic, String payload) {
        send(topic, payload);
    }
}
