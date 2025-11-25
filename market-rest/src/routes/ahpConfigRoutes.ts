import { Router } from 'express';
import { getAhpConfigByUserId } from '../controllers/ahpConfigController';
import { createAhpConfig, updateAhpConfig } from '../controllers/ahpConfigController';

const router = Router();

router.get('/get/:userId', getAhpConfigByUserId);
router.post('/create', createAhpConfig);
router.put('/update', updateAhpConfig);

export default router;

