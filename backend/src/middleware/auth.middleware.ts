import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';

export interface AuthRequest extends Request {
    user?: any;
    shopId?: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
        return;
    }

    req.user = decoded;

    // Extract shopId from header if present
    const shopIdHeader = req.headers['x-shop-id'];
    if (shopIdHeader) {
        req.shopId = Number(shopIdHeader);
    }

    next();
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
