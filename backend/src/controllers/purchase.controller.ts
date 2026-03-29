import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as purchaseService from '../services/purchase.service';

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const purchase = await purchaseService.createPurchase(req.body);
        res.status(201).json(purchase);
    } catch (error: any) {
        next(error);
    }
};

export const getAllPurchases = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        if (req.query.search) filters.search = String(req.query.search);
        if (req.query.supplierId) filters.supplierId = Number(req.query.supplierId);
        console.log('Filters:', filters);
        const purchases = await purchaseService.getAllPurchases(filters);
        res.json(purchases);
    } catch (error: any) {
        next(error);
    }
};

export const getPurchaseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const purchase = await purchaseService.getPurchaseById(Number(req.params.id));
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json(purchase);
    } catch (error: any) {
        next(error);
    }
};

// --- Suppliers ---

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const supplier = await purchaseService.createSupplier(req.body);
        res.status(201).json(supplier);
    } catch (error: any) {
        next(error);
    }
};

export const getAllSuppliers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.query.search) filters.search = String(req.query.search);
        const suppliers = await purchaseService.getAllSuppliers(filters);
        res.json(suppliers);
    } catch (error: any) {
        next(error);
    }
};

export const getAllPurchasePayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        if (req.query.supplierId) filters.supplierId = Number(req.query.supplierId);
        if (req.query.purchaseId) filters.purchaseId = Number(req.query.purchaseId);

        const payments = await purchaseService.getAllPurchasePayments(filters);
        res.json(payments);
    } catch (error: any) {
        next(error);
    }
};

export const clearSupplierBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await purchaseService.clearSupplierBalance(Number(req.params.id));
        res.json({ message: 'Supplier balance cleared successfully' });
    } catch (error: any) {
        next(error);
    }
};

export const clearPurchaseBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, method = 'CASH', notes = 'Balance Clearance' } = req.body;
        await purchaseService.clearPurchaseBalance(Number(req.params.id), Number(amount), method, notes);
        res.json({ message: 'Purchase balance cleared successfully' });
    } catch (error: any) {
        next(error);
    }
};
