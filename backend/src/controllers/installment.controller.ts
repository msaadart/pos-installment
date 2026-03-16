import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as installmentService from '../services/installment.service';
import * as expenseService from '../services/expense.service';
import * as customerService from '../services/customer.service';

export const createInstallmentSale = async (req: Request, res: Response) => {
    try {
        const result = await installmentService.createInstallmentSale(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getInstallmentPlans = async (req: AuthRequest, res: Response) => {
    try {
        const filters: any = { ...req.query };
        if (req.query.search) filters.search = String(req.query.search);
        if (req.query.phone) filters.phone = String(req.query.phone);
        if (req.query.cnic) filters.cnic = String(req.query.cnic);
        if (req.query.status) filters.status = String(req.query.status);

        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        const plans = await installmentService.getInstallmentPlans(filters);
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const payInstallment = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user;
        const { amount, paymentMethod, referenceId } = req.body;
        const installment = await installmentService.payInstallment(Number(req.params.id), amount, paymentMethod, referenceId, user);
        res.json(installment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
