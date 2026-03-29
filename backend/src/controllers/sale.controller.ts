import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as saleService from '../services/sale.service';

export const createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await saleService.createSale(req.body);
        res.status(201).json(sale);
    } catch (error: any) {
        next(error);
    }
};

export const getAllSales = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.query.shopId) filters.shopId = Number(req.query.shopId);
        if (req.query.userId) filters.userId = Number(req.query.userId);
        if (req.query.customerId) filters.customerId = Number(req.query.customerId);
        if (req.query.startDate && req.query.endDate) {
            filters.createdAt = {
                gte: new Date(String(req.query.startDate)),
                lte: new Date(String(req.query.endDate))
            };
        }

        const sales = await saleService.getAllSales(filters);
        res.json(sales);
    } catch (error: any) {
        next(error);
    }
};

export const getSaleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sale = await saleService.getSaleById(Number(req.params.id));
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error: any) {
        next(error);
    }
};
