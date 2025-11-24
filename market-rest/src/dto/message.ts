import type { KafkaEnvelope } from "../interfaces/KafkaEnvelope";

export class Message<T = unknown> implements KafkaEnvelope<T> {
    sourceId!: string;
    eventId!: string;
    uri!: string;
    timestamp!: string; // ISO 8601 with +07:00
    payload!: T;

    constructor(init?: Partial<KafkaEnvelope<T>>) {
        Object.assign(this, init);

        // Auto-set timestamp if not provided
        if (!this.timestamp) {
            this.timestamp = Message.generateUtc7Timestamp();
        }
    }

    private static generateUtc7Timestamp(): string {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const utc7 = new Date(utc + 7 * 60 * 60 * 1000);

        // Format ISO (remove Z) and append +07:00
        return utc7.toISOString().replace("Z", "") + "+07:00";
    }
}
