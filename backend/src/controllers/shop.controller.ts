import { Request, Response } from 'express';
import * as shopService from '../services/shop.service';

export const createShop = async (req: Request, res: Response) => {
    try {
        const shop = await shopService.createShop(req.body);
        res.status(201).json(shop);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllShops = async (req: Request, res: Response) => {
    try {
        const shops = await shopService.getAllShops();
        res.json(shops);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getShopById = async (req: Request, res: Response) => {
    try {
        const shop = await shopService.getShopById(Number(req.params.id));
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        res.json(shop);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateShop = async (req: Request, res: Response) => {
    try {
        const shop = await shopService.updateShop(Number(req.params.id), req.body);
        res.json(shop);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteShop = async (req: Request, res: Response) => {
    try {
        await shopService.deleteShop(Number(req.params.id));
        res.json({ message: 'Shop deactivated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
