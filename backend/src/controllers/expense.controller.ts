import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as expenseService from '../services/expense.service';

export const createExpense = async (req: Request, res: Response) => {
    try {
        const expense = await expenseService.createExpense(req.body);
        res.status(201).json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllExpenses = async (req: Request, res: Response) => {
    try {
        const filters: any = {};
        if (req.query.shopId) filters.shopId = Number(req.query.shopId);
        if (req.query.startDate && req.query.endDate) {
            filters.date = {
                gte: new Date(String(req.query.startDate)),
                lte: new Date(String(req.query.endDate))
            };
        }

        const expenses = await expenseService.getAllExpenses(filters);
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getExpenseById = async (req: Request, res: Response) => {
    try {
        const expense = await expenseService.getExpenseById(Number(req.params.id));
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteExpense = async (req: Request, res: Response) => {
    try {
        await expenseService.deleteExpense(Number(req.params.id));
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
