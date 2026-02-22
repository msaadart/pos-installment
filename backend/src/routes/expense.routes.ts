import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), expenseController.createExpense);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), expenseController.getAllExpenses);
router.get('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER']), expenseController.getExpenseById);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), expenseController.deleteExpense);

export default router;
