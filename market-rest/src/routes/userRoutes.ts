import { Router } from 'express';
import { getUserDetail } from '../controllers/userController';
import { createUser, updateUser, deleteUser, updatePassword } from '../controllers/userController';

const router = Router();

router.get('/getDetail/:userId', getUserDetail);
router.post('/create', createUser);
router.put('/update', updateUser);
router.delete('/delete', deleteUser);
router.put('/updatePassword', updatePassword);

export default router;
