import type { EachMessageHandler } from 'kafkajs';
import { Consumer } from 'kafkajs';
import { createConsumer } from '../config/kafka';
import { config } from '../config/env';

export class KafkaConsumer {
  private readonly consumer: Consumer;
  private readonly ready: Promise<void>;

  constructor() {
    this.consumer = createConsumer();
    this.ready = this.consumer
      .connect()
      .then(() =>
        this.consumer.subscribe({
          topic: config.kafka.clientId,
          fromBeginning: false,
        })
      );
  }

  async waitUntilReady(): Promise<void> {
    await this.ready;
  }

  async run(handler: EachMessageHandler): Promise<void> {
    await this.waitUntilReady();
    await this.consumer.run({
      eachMessage: handler,
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}

export const kafkaConsumer = new KafkaConsumer();

