import { Router } from 'express';
import { createStock, getAllStocksId, getStockById, updateStock, deleteStock, updateIndustryRatios } from '../controllers/stockController';

const router = Router();

router.get('/get/:stockId', getStockById);
router.get('/getAllStocksId', getAllStocksId);
router.post('/create', createStock);
router.put('/update', updateStock);
router.delete('/delete', deleteStock);
router.put('/updateIndustryRatios', updateIndustryRatios);

export default router;

