import { config } from "../config/env";
import { kafkaRequestResponseService } from "./kafkaRequestResponseService";
import type { ResponseDto } from "../dto/ResponseDto";
import type { SubscriptionDto } from "../dto/SubscriptionDto";

class SubscriptionQueueService {
  private readonly createUri = config.uri.subscription.create;

  async createSubscription(dto: SubscriptionDto): Promise<ResponseDto<string>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<
      SubscriptionDto,
      ResponseDto<string>
    >(this.createUri, dto);

    if (!message) {
      throw new Error("No response from subscription pipeline");
    }

    if (!message.payload) {
      throw new Error("Invalid Kafka response: missing payload");
    }

    return message.payload;
  }
}

export const subscriptionQueueService = new SubscriptionQueueService();
