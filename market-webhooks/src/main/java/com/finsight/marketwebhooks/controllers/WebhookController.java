package com.finsight.marketwebhooks.controllers;

import com.finsight.marketwebhooks.producer.KafkaProducer;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
public class WebhookController {
    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(WebhookController.class);
    private final KafkaProducer kafkaProducer;

    @Autowired
    public WebhookController(KafkaProducer kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }

    @PostMapping("/webhooks1")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload,
                                                @RequestHeader Map<String, String> headers
    ) {
        logger.info("Received webhook: {}", payload);
        kafkaProducer.publish(payload);
        return ResponseEntity.ok(null);
    }
}
