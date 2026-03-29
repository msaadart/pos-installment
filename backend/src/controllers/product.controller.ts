import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as productService from '../services/product.service';

// --- Categories ---
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await productService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error: any) {
        next(error);
    }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shopId = req.query.shopId ? Number(req.query.shopId) : undefined;
        const categories = await productService.getAllCategories(shopId);
        res.json(categories);
    } catch (error: any) {
        next(error);
    }
};

// --- Brands ---
export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brand = await productService.createBrand(req.body);
        res.status(201).json(brand);
    } catch (error: any) {
        next(error);
    }
};

export const getAllBrands = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brands = await productService.getAllBrands();
        res.json(brands);
    } catch (error: any) {
        next(error);
    }
};

// --- Products ---
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error: any) {
        next(error);
    }
};

export const getAllProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }

        if (req.query.categoryId) filters.categoryId = Number(req.query.categoryId);
        if (req.query.search) filters.search = String(req.query.search);

        const products = await productService.getAllProducts(filters);
        res.json(products);
    } catch (error: any) {
        next(error);
    }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await productService.getProductById(Number(req.params.id));
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error: any) {
        next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await productService.updateProduct(Number(req.params.id), req.body);
        res.json(product);
    } catch (error: any) {
        next(error);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await productService.deleteProduct(Number(req.params.id));
        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        next(error);
    }
};
