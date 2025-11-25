import { config } from "../config/env";
import { kafkaRequestResponseService } from "./kafkaRequestResponseService";
import type { StockYearDataDto } from "../dto/StockYearDataDto";
import type { ResponseDto } from "../dto/ResponseDto";

class StockYearDataQueueService {
  private readonly createStockYearDataUri = config.uri.stockYearData.create;
  private readonly updateStockYearDataUri = config.uri.stockYearData.update;
  private readonly deleteStockYearDataUri = config.uri.stockYearData.delete;

  async createStockYearData(stockYearData: StockYearDataDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<StockYearDataDto, ResponseDto<unknown>>(
        this.createStockYearDataUri,
        stockYearData
    );

    if (!message) {
      throw new Error('No response received from stock year data creation pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async updateStockYearData(stockYearData: StockYearDataDto, year: number): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<StockYearDataDto, ResponseDto<unknown>>(
        `${this.updateStockYearDataUri}${year}`,
        stockYearData
    );

    if (!message) {
      throw new Error('No response received from stock year data update pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async deleteStockYearData(stockYearData: StockYearDataDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<StockYearDataDto, ResponseDto<unknown>>(
        this.deleteStockYearDataUri,
        stockYearData
    );

    if (!message) {
      throw new Error('No response received from stock year data delete pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }
}

export const stockYearDataQueueService = new StockYearDataQueueService();