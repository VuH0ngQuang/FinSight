import { Router, Request, Response } from 'express';
import stockRoutes from './stockRoutes';
import userRoutes from './userRoutes';
import ahpConfigRoutes from './ahpConfigRoutes';
import stockYearDataRoutes from './stockYearDataRoutes';
import portfolioRoutes from './portfolioRoutes';
import subscriptionRoutes from './subscriptionRoutes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Market REST API' });
});

router.use('/stock', stockRoutes);
router.use('/user', userRoutes);
router.use('/ahpConfig', ahpConfigRoutes);
router.use('/stockYearData', stockYearDataRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/subscription', subscriptionRoutes);

export default router;

