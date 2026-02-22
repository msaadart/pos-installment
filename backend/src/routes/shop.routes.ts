import { Router } from 'express';
import { createShop, getAllShops, getShopById, updateShop, deleteShop } from '../controllers/shop.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (if any)
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), getAllShops);
router.get('/:id', authenticate, getShopById);

// Protected routes
router.post('/', authenticate, authorize(['SUPER_ADMIN']), createShop);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN']), updateShop);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteShop);

export default router;
