package com.finsight.collector.mqtt;

import com.finsight.collector.configurations.AppConf;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.net.ssl.SSLSocketFactory;

@Service
public class MqttService implements MqttCallback {
    private static final Logger logger = LoggerFactory.getLogger(MqttService.class);
    private final AppConf appConf;
    private MqttClient client;
    private String defaultTopic;

    @Autowired
    public MqttService(AppConf appConf) {
        this.appConf = appConf;
    }

    public void connect (String brokerUrl, String clientId, String username, String password) {
        if (client != null && client.isConnected()) {
            try {
                client.disconnect();
            } catch (MqttException e) {
                logger.error("MQTT {} got error: {}",brokerUrl,e.getMessage());
            }
        }

        try {
            client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
        } catch (MqttException e) {
            logger.error("MQTT {} got error: {}",brokerUrl,e.getMessage());
        }
        client.setCallback(this);

        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(false);
        options.setMaxInflight(32768);
        options.setAutomaticReconnect(true);

        // Enable TLS automatically for WSS
        if (brokerUrl.startsWith("wss://")) {
            options.setSocketFactory(SSLSocketFactory.getDefault());
        }

        if (username != null && password != null && !username.isBlank() && !password.isBlank()) {
            options.setUserName(username);
            options.setPassword(password.toCharArray());
        } else {
            logger.error("MQTT {} Username and/or password are both empty",brokerUrl);
        }

        try {
            client.connect(options);
        } catch (MqttException e) {
            logger.error("MQTT {} got error: {}",brokerUrl,e.getMessage());
        }
//        try {
//            client.subscribe(defaultTopic);
//        } catch (MqttException e) {
//            logger.error("MQTT {} got error: {}",brokerUrl,e.getMessage());
//        }
        logger.info("MQTT {} connected with clientId: {}", brokerUrl,clientId);
    }

    public void createDefaultTopic(String defaultTopic) {
        this.defaultTopic = defaultTopic;
    }

    public void send (String payload) {
        send(defaultTopic,payload);
    }

    public void send (String topic, String payload) {
        try {
            if (client == null || !client.isConnected()) {
                logger.error("Mqtt not connected");
                return;
            }
            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(1);
            client.publish(topic,message);
        } catch (Exception e) {
            logger.error("MQTT {} got error: {}",topic,e.getMessage());
        }
    }

    public void subscribe (String topic) {
        try {
            if (client == null || !client.isConnected()) {
                logger.error("Mqtt not connected");
            } else {
                try {
                    client.subscribe(topic);
                } catch (MqttException e) {
                    logger.error("MQTT {} got error: {}",topic,e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("MQTT {} got error: {}",topic,e.getMessage());
        }
    }

    @Override
    public void connectionLost(Throwable throwable) {
        logger.error("MQTT got error: {}",throwable.getMessage());
    }

    @Override
    public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
        String payload = new String(mqttMessage.getPayload());

        new Thread(() -> handleIncomingMessage(topic, payload)).start();
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {}

    protected void handleIncomingMessage(String topic, String payload){}
}
