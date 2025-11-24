import { randomUUID } from 'crypto';
import type { EachMessageHandler } from 'kafkajs';
import { kafkaProducer } from '../producer/KafkaProducer';
import { kafkaConsumer } from '../consumer/KafkaConsumer';
import { Message } from '../dto/message';
import { config } from '../config/env';
import type { KafkaEnvelope } from '../interfaces/KafkaEnvelope';

interface PendingResponse {
  resolve: (value: KafkaEnvelope<unknown> | null) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
}

interface SendOptions {
  sourceId?: string;
  timeoutMs?: number;
}

class KafkaRequestResponseService {
  private readonly pendingResponses = new Map<string, PendingResponse>();
  private readonly consumerReady: Promise<void>;
  private readonly defaultTimeoutMs = 15000;

  constructor() {
    this.consumerReady = kafkaConsumer.waitUntilReady();

    this.consumerReady
      .then(() => {
        void kafkaConsumer.run(this.handleIncomingMessage).catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Kafka consumer stopped unexpectedly', error);
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Kafka consumer', error);
      });
  }

  private handleIncomingMessage: EachMessageHandler = async ({ message }) => {
    const key = message.key?.toString();
    if (!key) {
      return;
    }

    const pending = this.pendingResponses.get(key);
    if (!pending) {
      return;
    }

    this.pendingResponses.delete(key);
    clearTimeout(pending.timeout);

    try {
      const rawValue = message.value?.toString();
      const parsed = rawValue ? (JSON.parse(rawValue) as KafkaEnvelope<unknown>) : null;
      pending.resolve(parsed);
    } catch (error) {
      pending.reject(error instanceof Error ? error : new Error('Failed to parse Kafka message'));
    }
  };

  async sendAndWait<TPayload, TResponse>(
    uri: string,
    payload: TPayload,
    options?: SendOptions
  ): Promise<{ key: string; message: KafkaEnvelope<TResponse> | null }> {
    await this.consumerReady;

    const correlationKey = randomUUID();
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;

    const envelope = new Message<TPayload>({
      sourceId: options?.sourceId ?? config.kafka.clientId,
      eventId: randomUUID(),
      uri,
      payload,
    });

    const responsePromise = new Promise<KafkaEnvelope<TResponse> | null>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(correlationKey);
        reject(new Error(`Kafka response timed out for key ${correlationKey}`));
      }, timeoutMs);

      this.pendingResponses.set(correlationKey, {
        resolve: (value) => resolve(value as KafkaEnvelope<TResponse> | null),
        reject,
        timeout,
      });
    });

    try {
      await kafkaProducer.send(envelope, { key: correlationKey });
    } catch (error) {
      const pending = this.pendingResponses.get(correlationKey);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingResponses.delete(correlationKey);
      }
      throw error;
    }

    const message = await responsePromise;
    return { key: correlationKey, message };
  }
}

export const kafkaRequestResponseService = new KafkaRequestResponseService();

