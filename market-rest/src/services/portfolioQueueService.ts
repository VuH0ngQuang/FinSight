import type { ResponseDto } from '../dto/ResponseDto';
import { kafkaRequestResponseService } from './kafkaRequestResponseService';
import { config } from '../config/env';
import type { PortfolioAllocationRequest } from '../dto/PortfolioAllocationRequest';

class PortfolioQueueService {
  private readonly allocateUri = config.uri.portfolio.allocate;

  async allocate(request: PortfolioAllocationRequest): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<
      PortfolioAllocationRequest,
      ResponseDto<unknown>
    >(this.allocateUri, request);

    if (!message) {
      throw new Error('No response received from portfolio allocation pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }
}

export const portfolioQueueService = new PortfolioQueueService();
