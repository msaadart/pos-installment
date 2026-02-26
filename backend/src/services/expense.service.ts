import prisma from '../utils/prisma';

export const createExpense = async (data: any) => {
    return await prisma.expense.create({ data });
};

export const getAllExpenses = async (filters: any) => {
    const { startDate, endDate, shopId, search } = filters;

    const where: any = {
        isActive: true
    };

    if (shopId) where.shopId = shopId;

    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (end) end.setHours(23, 59, 59, 999);
        where.date = {
            ...(start && { gte: start }),
            ...(end && { lte: end })
        };
    }

    if (search) {
        where.OR = [
            { description: { contains: search } }, // removed mode
            { category: { contains: search } }
        ];
    }

    return await prisma.expense.findMany({
        where,
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
