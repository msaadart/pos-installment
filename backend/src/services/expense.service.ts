import prisma from '../utils/prisma';

export const createExpense = async (data: any) => {
    return await prisma.expense.create({ data });
};

export const getAllExpenses = async (filters: any) => {
    return await prisma.expense.findMany({
        where: {
            ...filters,
            isActive: true
        },
        include: {
            shop: { select: { name: true } }
        },
        orderBy: { date: 'desc' }
    });
};

export const getExpenseById = async (id: number) => {
    return await prisma.expense.findUnique({
        where: { id },
        include: { shop: true }
    });
};

export const deleteExpense = async (id: number) => {
    return await prisma.expense.update({
        where: { id },
        data: { isActive: false }
    });
};
