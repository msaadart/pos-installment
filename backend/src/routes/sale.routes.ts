import { Router } from 'express';
import { createSale, getAllSales, getSaleById } from '../controllers/sale.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createSale);
router.get('/', authenticate, getAllSales);
router.get('/:id', authenticate, getSaleById);

export default router;
