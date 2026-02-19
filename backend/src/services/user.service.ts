import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

export const createUser = async (data: any) => {
    const { email, password, name, role, shopId } = data;

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(data);

    return await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
            shopId,
        },
    });
};

export const getAllUsers = async (filters: any) => {
    return await prisma.user.findMany({
        where: { ...filters, isActive: true },
        include: {
            shop: { select: { name: true } },
        },
    });
};

export const getUserById = async (id: number) => {
    return await prisma.user.findUnique({
        where: { id, isActive: true },
        include: {
            shop: true,
        },
    });
};

export const updateUser = async (id: number, data: any) => {
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    return await prisma.user.update({
        where: { id },
        data,
    });
};

export const deleteUser = async (id: number) => {
    return await prisma.user.update({
        where: { id },
        data: { isActive: false }
    });
};
