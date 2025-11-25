import { Router } from 'express';
import { getStockYearData } from '../controllers/stockYearDataController';
import { createStockYearData, updateStockYearData, deleteStockYearData } from '../controllers/stockYearDataController';

const router = Router();

router.get('/get/:stockId/:year', getStockYearData);
router.post('/create', createStockYearData);
router.put('/update/:year', updateStockYearData);
router.delete('/delete', deleteStockYearData);

export default router;

