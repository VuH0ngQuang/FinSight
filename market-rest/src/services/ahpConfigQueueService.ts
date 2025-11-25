import ResponseDto from "../dto/ResponseDto";
import AhpConfigDto from "../dto/AhpConfigDto";
import { kafkaRequestResponseService } from "./kafkaRequestResponseService";
import { config } from "../config/env";

class AhpConfigQueueService {
  private readonly createAhpConfigUri = config.uri.ahpConfig.create;
  private readonly updateAhpConfigUri = config.uri.ahpConfig.update;

  async createAhpConfig(ahpConfig: AhpConfigDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<AhpConfigDto, ResponseDto<unknown>>(
        this.createAhpConfigUri,
        ahpConfig
    );

    if (!message) {
      throw new Error('No response received from AHP config creation pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async updateAhpConfig(ahpConfig: AhpConfigDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<AhpConfigDto, ResponseDto<unknown>>(
        this.updateAhpConfigUri,
        ahpConfig
    );

    if (!message) {
      throw new Error('No response received from AHP config update pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }
}

export const ahpConfigQueueService = new AhpConfigQueueService();