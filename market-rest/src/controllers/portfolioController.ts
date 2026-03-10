import { Request, Response } from 'express';
import { portfolioQueueService } from '../services/portfolioQueueService';
import type { PortfolioAllocationRequest } from '../dto/PortfolioAllocationRequest';

export const allocatePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as PortfolioAllocationRequest;

    if (!payload.userId || !payload.budget || !payload.numberOfStocks) {
      res.status(400).json({ message: 'userId, budget, and numberOfStocks are required' });
      return;
    }

    const result = await portfolioQueueService.allocate(payload);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Failed to allocate portfolio', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
