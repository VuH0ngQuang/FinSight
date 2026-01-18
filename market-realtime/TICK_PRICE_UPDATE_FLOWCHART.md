┌─────────────────────────────────────────────────────────────┐
│           Kafka Broker Sends Tick Update Message           │
│  (Topic: market-data with URI: /stock/updateMatchPrice/...) │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│    Create New Thread for Asynchronous Processing            │
│    new Thread(() -> handleIncomingMessage(topic, key, value))│
│                    (Line 150)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Parse Message and Route to StockService              │
│  Message → StockDto → stockService.updateMatchPrice()       │
│                    (Line 185)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  StockServiceImpl.updateMatchPrice(String stockId,          │
│  BigDecimal matchPrice)                                     │
│                    (Line 181-198)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Acquire Lock for Stock ID                            │
│  ReentrantLock lock = lockManager.getLock(stockId)          │
│  lock.lock()                                                 │
│                    (Line 182-183)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Find Stock Entity in Database                        │
│  StockEntity stockEntity =                                   │
│      stockRepository.findById(stockId).orElse(null)         │
│                    (Line 185)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ├──────────────────────┐
                        ▼                      ▼
        ┌───────────────────────┐  ┌───────────────────────┐
        │  Stock Not Found       │  │  Stock Found          │
        │  Return                │  │  Continue Processing   │
        │  (Line 186-188)        │  │                       │
        └───────────┬───────────┘  └───────────┬───────────┘
                    │                          │
                    │                          ▼
                    │          ┌─────────────────────────────────────┐
                    │          │  Update Match Price in Entity      │
                    │          │  stockEntity.setMatchPrice(        │
                    │          │      matchPrice)                    │
                    │          │              (Line 192)             │
                    │          └───────────────┬─────────────────────┘
                    │                          │
                    │                          ▼
                    │          ┌─────────────────────────────────────┐
                    │          │  Save Stock Entity to Database     │
                    │          │  stockRepository.save(stockEntity)  │
                    │          │              (Line 193)              │
                    │          └───────────────┬─────────────────────┘
                    │                          │
                    └──────────┬───────────────┘
                               │
                               ▼
        ┌─────────────────────────────────────────────────────┐
        │         Release Lock                                  │
        │  lock.unlock()                                        │
        │              (Line 195-197)                           │
        └─────────────────────────────────────────────────────┘