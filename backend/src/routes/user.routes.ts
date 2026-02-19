import { Router } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Only Admins can manage users
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), createUser);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), getAllUsers);
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), getUserById);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), updateUser);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteUser);

export default router;
