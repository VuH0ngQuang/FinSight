import { Router } from 'express';
import {
  getUserDetail,
  getFavoriteStocks,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  loginUser,
  addFavoriteStock,
  removeFavoriteStock,
} from '../controllers/userController';

const router = Router();

router.get('/getDetail/:userId', getUserDetail);
router.get('/favoriteStocks/:userId', getFavoriteStocks);
router.post('/create', createUser);
router.put('/update', updateUser);
router.delete('/delete', deleteUser);
router.put('/updatePassword', updatePassword);
router.post('/login', loginUser);
router.post('/addFavoriteStock', addFavoriteStock);
router.post('/removeFavoriteStock', removeFavoriteStock);

export default router;
