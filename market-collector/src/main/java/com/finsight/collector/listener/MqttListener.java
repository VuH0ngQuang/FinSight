package com.finsight.collector.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.collector.auth.TokenClient;
import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.model.Stock;
import com.finsight.collector.mqtt.MqttService;
import com.finsight.collector.producer.KafkaProducer;
import com.finsight.collector.producer.MqttProducer;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MqttListener extends MqttService {

    public static final Logger logger = LoggerFactory.getLogger(MqttListener.class);
    public final AppConf appConf;
    public final TokenClient tokenClient;
    public final KafkaProducer kafkaProducer;
    public final MqttProducer mqttProducer;
    private final ObjectMapper objectMapper;

    @Autowired
    public MqttListener(AppConf appConf, TokenClient tokenClient, KafkaProducer kafkaProducer, MqttProducer mqttProducer, ObjectMapper objectMapper) {
        super(appConf);
        this.appConf = appConf;
        this.tokenClient = tokenClient;
        this.kafkaProducer = kafkaProducer;
        this.mqttProducer = mqttProducer;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        try {
            initConnection();
        } catch (IOException e) {
            logger.error("Error while initializing MQTT listener: {}",e.getMessage());
        }
    }

    public void initConnection() throws IOException {
        String password = tokenClient.getToken();
        String username = tokenClient.getInvestorId(password);
        connect(appConf.getDataFeed().getWebsocketUrl(),
                "<dnse-price-json-mqtt-ws-sub>-<>-<"+appConf.getClusterId()+">",
                username,
                password);
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/ACB");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/SHB");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/VCB");
        subscribe("plaintext/quotes/krx/mdds/tick/v1/roundlot/symbol/BID");
    }

    @Override
    public void connectionLost(Throwable cause) {
        try {
            initConnection();
        } catch (IOException e) {
            logger.error("Error while initializing MQTT listener: {}",e.getMessage());
        }
    }

    @Override
    protected void handleIncomingMessage(String topic, String message) {
        logger.info("Received MQTT message on topic {}: {}", topic, message);
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            Stock stock = new Stock();
            stock.setStockId(jsonNode.get("symbol").asText());
            stock.setMatchPrice(jsonNode.get("matchPrice").decimalValue());
            String payload = objectMapper.writeValueAsString(stock);

            kafkaProducer.publish(payload);
            mqttProducer.publish(payload);
        } catch (Exception e) {
            logger.error("Error processing MQTT message: {}", e.getMessage(), e);
        }
    }

    // Runs at 7:45 AM Monday–Friday
    @Scheduled(cron = "0 45 8 * * MON-FRI")
    private void scheduleReset() throws IOException {
        initConnection();
    }
}
