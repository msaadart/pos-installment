import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as purchaseService from '../services/purchase.service';

export const createPurchase = async (req: Request, res: Response) => {
    try {
        const purchase = await purchaseService.createPurchase(req.body);
        res.status(201).json(purchase);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPurchases = async (req: AuthRequest, res: Response) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }

        if (req.query.supplierId) filters.supplierId = Number(req.query.supplierId);

        const purchases = await purchaseService.getAllPurchases(filters);
        res.json(purchases);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPurchaseById = async (req: Request, res: Response) => {
    try {
        const purchase = await purchaseService.getPurchaseById(Number(req.params.id));
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json(purchase);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- Suppliers ---

export const createSupplier = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const supplier = await purchaseService.createSupplier(req.body);
        res.status(201).json(supplier);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllSuppliers = async (req: Request, res: Response) => {
    try {

        const suppliers = await purchaseService.getAllSuppliers();
        console.log(suppliers);
        res.json(suppliers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const clearSupplierBalance = async (req: Request, res: Response) => {
    try {
        await purchaseService.clearSupplierBalance(Number(req.params.id));
        res.json({ message: 'Supplier balance cleared successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const clearPurchaseBalance = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;
        await purchaseService.clearPurchaseBalance(Number(req.params.id), Number(amount));
        res.json({ message: 'Purchase balance cleared successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
