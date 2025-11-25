import { Router, Request, Response } from 'express';
import stockRoutes from './stockRoutes';
import userRoutes from './userRoutes';
import ahpConfigRoutes from './ahpConfigRoutes';
import stockYearDataRoutes from './stockYearDataRoutes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Market REST API' });
});

router.use('/stock', stockRoutes);
router.use('/user', userRoutes);
router.use('/ahpConfig', ahpConfigRoutes);
router.use('/stockYearData', stockYearDataRoutes);

export default router;

