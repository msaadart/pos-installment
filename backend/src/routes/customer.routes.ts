import { Router } from 'express';
import { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customer.controller';
import { authenticate, authorize} from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), createCustomer);
router.get('/', authenticate, getAllCustomers);
router.get('/:id', authenticate, getCustomerById);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), updateCustomer);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), deleteCustomer);

export default router;
