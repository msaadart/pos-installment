import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as reportService from '../services/report.service';

export const getRecentSale = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        filters.shopId = req.user.shopId;
        filters.saleType = String(req.query.saleType || 'CASH');
        const stats = await reportService.getRecentSale(filters);
        res.json(stats);
    } catch (error: any) {
        next(error);
    }
};

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }

        const { startDate, endDate } = req.query;
        if (startDate && endDate) {
            filters.startDate = new Date(String(startDate));
            filters.endDate = new Date(String(endDate));
        }
        // console.log('Dashboard filters:', filters);
        // if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
        // if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

        const stats = await reportService.getDashboardStats(filters);
        res.json(stats);
    } catch (error: any) {
        next(error);
    }
};

export const getSalesReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Start and End dates required' });

        const filters: any = {
            startDate: new Date(String(startDate)),
            endDate: new Date(String(endDate))
        };
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }

        const report = await reportService.getSalesReport(filters);
        res.json(report);
    } catch (error: any) {
        next(error);
    }
};

export const getStockReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        const report = await reportService.getStockReport(filters);
        res.json(report);
    } catch (error: any) {
        next(error);
    }
};

export const getInstallmentDueReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = { ...req.query };
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        const report = await reportService.getInstallmentDueReport(filters);
        res.json(report);
    } catch (error: any) {
        next(error);
    }
};

export const getCustomerInstallmentSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = { ...req.query };
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        console.log('Customer Installment Summary filters:', filters);
        const report = await reportService.getCustomerInstallmentSummary(filters);
        res.json(report);
    } catch (error: any) {
        next(error);
    }
};
