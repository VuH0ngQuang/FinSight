package com.finsight.marketwebhooks.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketwebhooks.dto.PaymentDto;
import com.finsight.marketwebhooks.producer.KafkaProducer;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.exception.WebhookException;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.util.Map;

@RestController
@RequestMapping
public class WebhookController {
    private static final Logger logger = org.slf4j.LoggerFactory.getLogger(WebhookController.class);
    private final ObjectMapper objectMapper;
    private final KafkaProducer kafkaProducer;
    private final PayOS payOS;

    @Autowired
    public WebhookController(
            KafkaProducer kafkaProducer,
            PayOS payOS,
            ObjectMapper objectMapper
    ) {
        this.kafkaProducer = kafkaProducer;
        this.payOS = payOS;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/webhooks1")
    public ResponseEntity<Void> handleWebhook(@RequestBody Webhook payload,
                                                @RequestHeader Map<String, String> headers
    ) {
        logger.info("Received webhook: {}", payload);
        try {
            WebhookData data = payOS.webhooks().verify(payload);
            logger.info("Verified webhook data: {}", data);
            PaymentDto paymentDto = new PaymentDto();
            paymentDto.setId(data.getOrderCode());
            if (data.getDesc().equals("Thành công")) {
                paymentDto.setSuccess(true);
            } else {
                paymentDto.setSuccess(false);
                paymentDto.setErrorMessage("Payment failed with description: " + data.getDesc());
            }
            kafkaProducer.publish(objectMapper.writeValueAsString(paymentDto));
//            logger.info(paymentDto.toString());
        } catch (WebhookException e) {
            logger.error("Webhook verification failed: {}", e.getMessage());
            PaymentDto paymentDto = PaymentDto.builder()
                    .id(payload.getData().getOrderCode())
                    .success(false)
                    .errorMessage(e.getMessage())
                    .build();
            kafkaProducer.publish(paymentDto.toString());
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok(null);
    }
}
