package com.finsight.collector.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.collector.configurations.AppConf;
import com.finsight.collector.model.Message;
import jakarta.annotation.PreDestroy;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.Properties;
import java.util.UUID;

@Service
public class KafkaService {
    private static final Logger logger = LoggerFactory.getLogger(KafkaService.class);
    private ObjectMapper mapper;
    private final AppConf appConf;
    private KafkaProducer producer;
    private KafkaConsumer consumer;
    private String defaultTopic;
    private Thread consumerThread;

    private volatile boolean running = false;

    @Autowired
    public KafkaService(AppConf appConf, ObjectMapper mapper) {
        this.appConf = appConf;
        this.mapper = mapper;
    }

    public void connectProducer(String bootstrapServers, String clientId, String groupId) {
        if (producer != null) {
            try {
                producer.close();
            } catch (Exception e) {
                logger.error("Kafka {} got error when closing: {}",bootstrapServers,e.getMessage());
            }
        }

        try {
            Properties props = new Properties();
            props.put("bootstrap.servers", bootstrapServers);
            props.put("client.id", clientId);
            props.put("group.id", groupId);
            props.put("key.serializer", StringSerializer.class.getName());
            props.put("value.serializer", StringSerializer.class.getName());

            producer = new KafkaProducer<>(props);
            logger.info("KAFKA {} producer connected with clientId: {}", bootstrapServers, clientId);
        } catch (Exception e) {
            logger.error("KAFKA {} got error creating producer: {}", bootstrapServers, e.getMessage());
        }
    }

    public void createDefaultTopic(String topic) {
        this.defaultTopic = topic;
    }

    public void send(String payload) {
        send(defaultTopic, payload);
    }

    public void send(String topic, String payload){
        if (producer == null) {
            logger.error("KAFKA {} producer not initialized", topic);
            return;
        }

        try {
            ProducerRecord<String, String> record = new ProducerRecord<>(topic, payload);
            producer.send(record, (RecordMetadata metadata, Exception exception) -> {
                if (exception != null) {
                    logger.error("KAFKA {} got error: {}", topic, exception.getMessage());
                }
            });
        } catch (Exception e) {
            logger.error("KAFKA {} got error: {}", topic, e.getMessage());
        }
    }

    public void startConsumer(String bootstrapServers, String groupId, Collection<String> topics) {
        if (consumer != null) {
            logger.error("KAFKA {} consumer already started", bootstrapServers);
            return;
        }

        try {
            Properties props = new Properties();
            props.put("bootstrap.servers", bootstrapServers);
            props.put("client.id", appConf.getClusterId());
            props.put("group.id", groupId);
            props.put("key.deserializer", StringDeserializer.class.getName());
            props.put("value.deserializer", StringDeserializer.class.getName());
            props.put("enable.auto.commit", "true");
            props.put("auto.commit.interval.ms", "1000");
            props.put("auto.offset.reset", "earliest");

            consumer = new KafkaConsumer<>(props);
            consumer.subscribe(topics);

            running = true;

            consumerThread = new Thread(() -> {
                try {
                    while (running) {
                        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));

                        for (ConsumerRecord<String, String> record : records) {
                            String topic = record.topic();
                            String key = record.key();
                            String value = record.value();

                            new Thread(() -> handleIncomingMessage(topic, key, value)).start();
                        }
                    }
                } catch (WakeupException e) {
                    logger.info("KAFKA {} consumer wakeup", bootstrapServers);
                } catch (Exception e) {
                    logger.error("KAFKA {} consumer got error: {}", bootstrapServers, e.getMessage());
                } finally {
                    try {
                        consumer.close();
                    } catch (Exception e) {
                        logger.error("KAFKA {} got error closing consumer: {}", bootstrapServers, e.getMessage());
                    }
                }
            }, "kafka-consumer-thread");

            consumerThread.start();
            logger.info("KAFKA {} consumer started with groupId: {} topics: {}", bootstrapServers, groupId, topics);

        } catch (Exception e) {
            logger.error("KAFKA {} consumer start error: {}", bootstrapServers, e.getMessage());
        }
    }

    public void subscribe(String topic) {
        if (consumer == null) {
            logger.error("KAFKA {} consumer not started", topic);
            return;
        }
        try {
            consumer.subscribe(Collections.singletonList(topic));
            logger.info("KAFKA subscribed to topic {}", topic);
        } catch (Exception e) {
            logger.error("KAFKA {} got error: {}", topic, e.getMessage());
        }
    }

    @PreDestroy
    public void shutdown() {
        logger.info("KAFKA shutting down");

        running = false;

        try {
            if (consumer != null) {
                consumer.wakeup(); // break poll()
            }
        } catch (Exception e) {
            logger.error("KAFKA consumer wakeup error: {}", e.getMessage());
        }

        try {
            if (consumerThread != null) {
                consumerThread.join(1000);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        try {
            if (producer != null) {
                producer.flush();
                producer.close();
            }
        } catch (Exception e) {
            logger.error("KAFKA producer close error: {}", e.getMessage());
        }
    }

    public String toJson(String message, String uri) {
        Message msg = Message.builder()
                .sourceId(appConf.getClusterId())
                .eventId(UUID.randomUUID().toString())
                .uri(uri)
                .payload(message)
                .build();

        try {
            return mapper.writeValueAsString(msg);
        } catch (Exception e) {
            logger.error("KAFKA toJson error: {}", e.getMessage());
            return "";
        }
    }

    protected void handleIncomingMessage(String topic, String key, String payload){}
}
