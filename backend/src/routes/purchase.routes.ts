import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.createPurchase);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.getAllPurchases);
router.get('/payments', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.getAllPurchasePayments);

// Suppliers
router.post('/suppliers', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.createSupplier);
router.get('/suppliers', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.getAllSuppliers);
router.patch('/suppliers/:id/clear-balance', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.clearSupplierBalance);

router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.getPurchaseById);
router.patch('/:id/clear-balance', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), purchaseController.clearPurchaseBalance);
export default router;
