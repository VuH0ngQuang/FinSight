import { Request, Response } from 'express';
import { ahpConfigService } from '../services/ahpConfigService';
import { ahpConfigQueueService } from '../services/ahpConfigQueueService';
import type { AhpConfigDto } from '../dto/AhpConfigDto';

export const getAhpConfigByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
      return;
    }

    const config = await ahpConfigService.getByUserId(userId);

    if (!config) {
      res.status(404).json({ message: `AHP config for user ${userId} not found` });
      return;
    }

    res.json({ data: config });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get AHP config', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createAhpConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const ahpConfigPayload = req.body as AhpConfigDto;
    const result = await ahpConfigQueueService.createAhpConfig(ahpConfigPayload);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create AHP config', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateAhpConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const ahpConfigPayload = req.body as AhpConfigDto;
    const result = await ahpConfigQueueService.updateAhpConfig(ahpConfigPayload);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to update AHP config', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

