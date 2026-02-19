import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await customerService.createCustomer(req.body);
        res.status(201).json(customer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.json(customers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const customer = await customerService.getCustomerById(Number(req.params.id));
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await customerService.updateCustomer(Number(req.params.id), req.body);
        res.json(customer);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        await customerService.deleteCustomer(Number(req.params.id));
        res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
