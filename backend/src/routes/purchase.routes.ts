import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.createPurchase);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), purchaseController.getAllPurchases);

// Suppliers
router.post('/suppliers', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.createSupplier);
router.get('/suppliers', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), purchaseController.getAllSuppliers);

router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), purchaseController.getPurchaseById);
export default router;
