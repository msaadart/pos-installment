import { Router } from 'express';
import { createInstallmentSale, getInstallmentPlans, payInstallment } from '../controllers/installment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createInstallmentSale);
router.get('/', authenticate, getInstallmentPlans);
router.post('/:id/pay', authenticate, payInstallment);

export default router;
