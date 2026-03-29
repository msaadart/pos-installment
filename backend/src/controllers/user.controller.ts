import { NextFunction } from 'express';
import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.createUser(req.body);
        console.log(user);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json(userWithoutPassword);
    } catch (error: any) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters: any = {};
        if (req.query.role) filters.role = req.query.role;
        if (req.query.shopId) filters.shopId = Number(req.query.shopId);

        const users = await userService.getAllUsers(filters);
        const usersWithoutPassword = users.map(user => {
            const { password, ...u } = user;
            return u;
        });
        res.json(usersWithoutPassword);
    } catch (error: any) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserById(Number(req.params.id));
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUser(Number(req.params.id), req.body);
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error: any) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userService.deleteUser(Number(req.params.id));
        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        next(error);
    }
};
