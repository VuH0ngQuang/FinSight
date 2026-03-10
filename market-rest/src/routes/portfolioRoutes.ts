import { Router } from 'express';
import { allocatePortfolio } from '../controllers/portfolioController';

const router = Router();

router.post('/allocate', allocatePortfolio);

export default router;
