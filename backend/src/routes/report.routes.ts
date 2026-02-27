import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), reportController.getDashboard);
router.get('/sales', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), reportController.getSalesReport);
router.get('/stock', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), reportController.getStockReport);
router.get('/installment-due', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), reportController.getInstallmentDueReport);
router.get('/customer-summary', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), reportController.getCustomerInstallmentSummary);

export default router;
