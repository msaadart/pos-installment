import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const stats = await reportService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSalesReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Start and End dates required' });

        const report = await reportService.getSalesReport(new Date(String(startDate)), new Date(String(endDate)));
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStockReport = async (req: Request, res: Response) => {
    try {
        const report = await reportService.getStockReport();
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getInstallmentDueReport = async (req: Request, res: Response) => {
    try {
        const report = await reportService.getInstallmentDueReport(req.query);
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCustomerInstallmentSummary = async (req: Request, res: Response) => {
    try {
        const report = await reportService.getCustomerInstallmentSummary(req.query);
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
