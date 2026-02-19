import { Request, Response } from 'express';
import * as installmentService from '../services/installment.service';

export const createInstallmentSale = async (req: Request, res: Response) => {
    try {
        const result = await installmentService.createInstallmentSale(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getInstallmentPlans = async (req: Request, res: Response) => {
    try {
        const plans = await installmentService.getInstallmentPlans(req.query);
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const payInstallment = async (req: Request, res: Response) => {
    try {
        const { amount, paymentMethod, referenceId } = req.body;
        const installment = await installmentService.payInstallment(Number(req.params.id), amount, paymentMethod, referenceId);
        res.json(installment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
