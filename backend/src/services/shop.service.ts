import prisma from '../utils/prisma';

export const createShop = async (data: any) => {
    return await prisma.shop.create({
        data,
    });
};

export const getAllShops = async () => {
    return await prisma.shop.findMany({
        where: { isActive: true },
        include: {
            users: { select: { id: true, name: true, email: true, role: true } },
        },
    });
};

export const getShopById = async (id: number) => {
    return await prisma.shop.findUnique({
        where: { id },
        include: {
            users: true,
            products: true,
        },
    });
};

export const updateShop = async (id: number, data: any) => {
    return await prisma.shop.update({
        where: { id },
        data,
    });
};

export const deleteShop = async (id: number) => {
    // Soft delete typically, but for now hard delete or status update
    return await prisma.shop.update({
        where: { id },
        data: { isActive: false },
    });
};
