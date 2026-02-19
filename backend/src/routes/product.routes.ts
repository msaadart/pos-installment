import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Categories
router.post('/categories', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), productController.createCategory);
router.get('/categories', authenticate, productController.getAllCategories);

// Brands
router.post('/brands', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), productController.createBrand);
router.get('/brands', authenticate, productController.getAllBrands);

// Products
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), productController.createProduct);
router.get('/', authenticate, productController.getAllProducts);
router.get('/:id', authenticate, productController.getProductById);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'SHOP_ADMIN']), productController.updateProduct);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), productController.deleteProduct);

export default router;
