import { Kafka, KafkaConfig } from 'kafkajs';
import { config } from './env';

let kafkaInstance: Kafka | null = null;

const buildKafkaConfig = (): KafkaConfig => ({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  retry: {
    retries: 5,
  },
});

export const getKafka = (): Kafka => {
  if (!kafkaInstance) {
    kafkaInstance = new Kafka(buildKafkaConfig());
  }
  return kafkaInstance;
};

export const createProducer = () => {
  return getKafka().producer();
};

export const createConsumer = () => {
  return getKafka().consumer({
    groupId: config.kafka.groupId,
  });
};

