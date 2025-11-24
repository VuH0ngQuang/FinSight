import { randomUUID } from 'crypto';
import type { Message } from 'kafkajs';
import { Producer } from 'kafkajs';
import { createProducer } from '../config/kafka';
import { config } from '../config/env';

interface SendOptions {
  key?: string;
  topic?: string;
}

export class KafkaProducer {
  private readonly producer: Producer;
  private readonly ready: Promise<void>;

  constructor() {
    this.producer = createProducer();
    this.ready = this.producer.connect();
  }

  async send<T>(payload: T, options?: SendOptions): Promise<string> {
    const messageKey = options?.key ?? randomUUID();
    const topic = options?.topic ?? config.kafka.topics.rest;

    const kafkaMessage: Message = {
      key: messageKey,
      value: JSON.stringify(payload),
    };

    await this.ready;
    await this.producer.send({
      topic,
      messages: [kafkaMessage],
    });

    return messageKey;
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}

export const kafkaProducer = new KafkaProducer();

