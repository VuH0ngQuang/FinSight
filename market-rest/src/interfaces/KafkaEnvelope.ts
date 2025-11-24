export interface KafkaEnvelope<T = unknown> {
  sourceId: string;
  eventId?: string;
  uri: string;
  timestamp?: string;
  payload: T;
}

