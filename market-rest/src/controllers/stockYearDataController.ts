import { Request, Response } from 'express';
import { stockYearDataService } from '../services/stockYearDataService';
import { stockYearDataQueueService } from '../services/stockYearDataQueueService';
import type { StockYearDataDto } from '../dto/StockYearDataDto';

export const getStockYearData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stockId, year } = req.params;

    if (!stockId || !year) {
      res.status(400).json({ message: 'stockId and year are required' });
      return;
    }

    const parsedYear = Number(year);
    if (Number.isNaN(parsedYear)) {
      res.status(400).json({ message: 'year must be a number' });
      return;
    }

    const result = await stockYearDataService.getByStockAndYear(stockId, parsedYear);

    if (!result) {
      res.status(404).json({ message: `Year ${parsedYear} for stock ${stockId} not found` });
      return;
    }

    res.json({ data: result });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get stock year data', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createStockYearData = async (req: Request, res: Response): Promise<void> => {
  try {
    const stockYearDataPayload = req.body as StockYearDataDto;
    const result = await stockYearDataQueueService.createStockYearData(stockYearDataPayload);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create stock year data', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateStockYearData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.params;
    const stockYearDataPayload = req.body as StockYearDataDto;
    const parsedYear = Number(year);

    if (Number.isNaN(parsedYear)) {
      res.status(400).json({ message: 'year must be a number' });
      return;
    }

    const result = await stockYearDataQueueService.updateStockYearData(stockYearDataPayload, parsedYear);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error('Failed to update stock year data', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteStockYearData = async (req: Request, res: Response): Promise<void> => {
  try {
    const stockYearDataPayload = req.body as StockYearDataDto;
    const result = await stockYearDataQueueService.deleteStockYearData(stockYearDataPayload);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete stock year data', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

