import prisma from '../utils/prisma';

export const createCustomer = async (data: any) => {
    return await prisma.customer.create({ data });
};

export const getAllCustomers = async (filters: any = {}) => {
    return await prisma.customer.findMany({
        where: { ...filters, isActive: true },
        orderBy: { name: 'asc' }
    });
};

export const getCustomerById = async (id: number) => {
    return await prisma.customer.findFirst({
        where: { id, isActive: true }
    });
};

export const updateCustomer = async (id: number, data: any) => {
    return await prisma.customer.update({ where: { id }, data });
};

export const deleteCustomer = async (id: number) => {
    return await (prisma.customer as any).update({
        where: { id },
        data: { isActive: false }
    });
};
