import { Request, Response } from 'express';
import { stockService } from '../services/stockService';
import { stockQueueService } from '../services/stockQueueService';
import type { StockDto } from '../dto/StockDto';

export const getStockById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { stockId } = req.params;
        if (!stockId) {
            res.status(400).json({ message: 'stockId is required' });
            return;
        }

        const stock = await stockService.getStockById(stockId);

        if (!stock) {
            res.status(404).json({ message: `Stock ${stockId} not found` });
            return;
        }

        res.json({ data: stock });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get stock', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getAllStocksId = async (_req: Request, res: Response): Promise<void> => {
    try {
        const stockIds = await stockService.getAllStocksId();
        res.json({ data: stockIds });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get stock IDs', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const createStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const stockPayload = req.body as StockDto;
        const result = await stockQueueService.createStock(stockPayload);

        const statusCode = result.success ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to create stock', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const stockPayload = req.body as StockDto;
        const result = await stockQueueService.updateStock(stockPayload);

        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update stock', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteStock = async (req: Request, res: Response): Promise<void> => {
    try {
        const stockPayload = req.body as StockDto;
        const result = await stockQueueService.deleteStock(stockPayload);

        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to delete stock', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateIndustryRatios = async (req: Request, res: Response): Promise<void> => {
    try {
        const stockPayload = req.body as StockDto;
        const result = await stockQueueService.updateIndustryRatios(stockPayload);

        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update industry ratios', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};