import type { ResponseDto } from '../dto/ResponseDto';
import type { StockDto } from '../dto/StockDto';
import { kafkaRequestResponseService } from './kafkaRequestResponseService';
import { config } from '../config/env';

class StockQueueService {
  private readonly createStockUri = config.uri.stock.create;
  private readonly updateStockUri = config.uri.stock.update;
  private readonly deleteStockUri = config.uri.stock.delete;
  private readonly updateIndustryRatiosUri = config.uri.stock.updateIndustryRatios;

  async createStock(stock: StockDto): Promise<ResponseDto<unknown>> {
    const { message } =
      await kafkaRequestResponseService.sendAndWait<StockDto, ResponseDto<unknown>>(
        this.createStockUri,
        stock
      );

    if (!message) {
      throw new Error('No response received from stock creation pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async updateStock(stock: StockDto): Promise<ResponseDto<unknown>> {
    const { message } =
      await kafkaRequestResponseService.sendAndWait<StockDto, ResponseDto<unknown>>(
        this.updateStockUri,
        stock
      );

    if (!message) {
      throw new Error('No response received from stock update pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async deleteStock(stock: StockDto): Promise<ResponseDto<unknown>> {
    const { message } =
      await kafkaRequestResponseService.sendAndWait<StockDto, ResponseDto<unknown>>(
        this.deleteStockUri,
        stock
      );

    if (!message) {
      throw new Error('No response received from stock delete pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async updateIndustryRatios(stock: StockDto): Promise<ResponseDto<unknown>> {
    const { message } =
      await kafkaRequestResponseService.sendAndWait<StockDto, ResponseDto<unknown>>(
        this.updateIndustryRatiosUri,
        stock
      );

      if (!message) {
        throw new Error('No response received from stock update industry ratios pipeline');
      }
  
      if (!message.payload) {
        throw new Error('Invalid Kafka response: missing payload');
      }

      return message.payload;
  }
}

export const stockQueueService = new StockQueueService();

