import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils';

export const registerUser = async (data: any) => {
    const { email, password, name, role, shopId } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: role || 'SALES_USER', // Default to sales user
            shopId: shopId || null
        },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, shopId: user.shopId });
    return { user, token };
};
