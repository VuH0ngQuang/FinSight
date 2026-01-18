┌─────────────────────────────────────────────────────────────┐
│           MQTT Broker Sends Tick Update Message            │
│  (Topic: plaintext/quotes/krx/mdds/tick/v1/roundlot/...)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  MqttService.messageArrived(String topic, MqttMessage msg)  │
│                    (Line 115-119)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Extract Payload: String payload =                   │
│         new String(mqttMessage.getPayload())                │
│                    (Line 116)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│    Create New Thread for Asynchronous Processing            │
│    new Thread(() -> handleIncomingMessage(topic, payload))  │
│                    (Line 118)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  MqttListener.handleIncomingMessage(String topic, String)   │
│                    (Line 72-86)                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Log Received Message                            │
│  logger.info("Received MQTT message on topic {}: {}", ...)  │
│                    (Line 73)                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Parse JSON Message                              │
│  JsonNode jsonNode = objectMapper.readTree(message)         │
│                    (Line 75)                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            Create Stock Object                               │
│  Stock stock = new Stock()                                  │
│  stock.setStockId(jsonNode.get("symbol").asText())          │
│  stock.setMatchPrice(jsonNode.get("matchPrice").decimal...) │
│                    (Line 76-78)                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Convert Stock to JSON String                         │
│  String payload = objectMapper.writeValueAsString(stock)     │
│                    (Line 79)                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ├──────────────────────┐
                        ▼                      ▼
        ┌───────────────────────┐  ┌───────────────────────┐
        │  KafkaProducer        │  │  MqttProducer         │
        │  .publish(payload)    │  │  .publish(payload)    │
        │       (Line 81)       │  │       (Line 82)       │
        └───────────┬───────────┘  └───────────┬───────────┘
                    │                          │
                    ▼                          ▼
        ┌───────────────────────┐  ┌───────────────────────┐
        │  Wrap in Message      │  │  Send to MQTT Topic   │
        │  with URI:            │  │  (market-data topic)  │
        │  /stock/updateMatch   │  │                       │
        │  Price/               │  │                       │
        │  (Line 35)            │  │  (Line 32)            │
        └───────────┬───────────┘  └───────────┬───────────┘
                    │                          │
                    ▼                          ▼
        ┌───────────────────────┐  ┌───────────────────────┐
        │  Publish to Kafka     │  │  Publish to MQTT      │
        │  Topic                │  │  Broker               │
        │  (market-data topic)   │  │                       │
        └───────────────────────┘  └───────────────────────┘

                        │
                        │ (If Exception)
                        ▼
        ┌─────────────────────────────────────────────────────┐
        │         Log Error                                    │
        │  logger.error("Error processing MQTT message: {}",  │
        │              e.getMessage(), e)                     │
        │              (Line 84)                               │
        └─────────────────────────────────────────────────────┘