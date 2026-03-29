import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as customerService from '../services/customer.service';

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (error: any) {
        next(error);
    }
};

export const getAllCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.user.role !== 'SUPER_ADMIN') {
            filters.shopId = req.user.shopId;
        } else if (req.shopId) {
            filters.shopId = req.shopId;
        }
        if (req.query.search) filters.search = String(req.query.search);

        const customers = await customerService.getAllCustomers(filters);
        res.json(customers);
    } catch (error: any) {
        next(error);
    }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.getCustomerById(Number(req.params.id));
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error: any) {
        next(error);
    }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
        res.json(customer);
    } catch (error: any) {
        next(error);
    }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await customerService.deleteCustomer(Number(req.params.id));
        res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        next(error);
    }
};
