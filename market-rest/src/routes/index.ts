import { Router, Request, Response } from 'express';
import stockRoutes from './stockRoutes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Market REST API' });
});

router.use('/stock', stockRoutes);

export default router;

