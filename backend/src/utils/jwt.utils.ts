import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (payload: any, expiresIn: string | number = '8h') => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
};
