import prisma from '../utils/prisma';

export const getDashboardStats = async (filters: any = {}) => {
    const { shopId, startDate, endDate } = filters;

    const baseFilter: any = {};
    if (shopId) baseFilter.shopId = shopId;

    // Date filter for models that use createdAt
    const createdAtFilter: any = {};
    if (startDate || endDate) {
        createdAtFilter.createdAt = {};
        if (startDate) createdAtFilter.createdAt.gte = new Date(startDate);
        if (endDate) createdAtFilter.createdAt.lte = new Date(endDate);
    }

    // Date filter for Expense (uses `date` field)
    const expenseDateFilter: any = {};
    if (startDate || endDate) {
        expenseDateFilter.date = {};
        if (startDate) expenseDateFilter.date.gte = new Date(startDate);
        if (endDate) expenseDateFilter.date.lte = new Date(endDate);
    }

    const [
        activeInstallments,
        totalCustomers,
        totalSalesAggregate,
        totalExpensesAggregate,
        totalProducts,
        totalUsers,
        totalShops,
        recentSales
    ] = await Promise.all([

        prisma.installmentPlan.count({
            where: { ...baseFilter, ...createdAtFilter, status: 'ACTIVE' }
        }),

        prisma.customer.count({
            where: { ...baseFilter, ...createdAtFilter }
        }),

        prisma.sale.aggregate({
            where: { ...baseFilter, ...createdAtFilter },
            _sum: { totalAmount: true }
        }),

        prisma.expense.aggregate({
            where: { ...baseFilter, ...expenseDateFilter, isActive: true },
            _sum: { amount: true }
        }),

        prisma.product.count({
            where: baseFilter
        }),

        prisma.user.count({
            where: { ...baseFilter, ...createdAtFilter }
        }),

        prisma.shop.count(),

        prisma.sale.findMany({
            where: { ...baseFilter, ...createdAtFilter },
            take: 200,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        })
    ]);

    return {
        totalSales: Number(totalSalesAggregate._sum?.totalAmount) || 0,
        totalProducts,
        totalUsers,
        totalShops,
        activeInstallmentsCount: activeInstallments,
        totalCustomers,
        totalExpenses: Number(totalExpensesAggregate._sum?.amount) || 0,
        recentSales
    };
};

export const getSalesReport = async (filters: any) => {
    const { startDate, endDate, shopId } = filters;
    return await prisma.sale.findMany({
        where: {
            createdAt: { gte: startDate, lte: endDate },
            ...(shopId ? { shopId } : {})
        },
        include: { items: true, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200
    });
};

export const getStockReport = async (filters: any = {}) => {
    const { shopId } = filters;
    return await prisma.product.findMany({
        where: {
            stock: { lte: 10 },
            ...(shopId ? { shopId } : {})
        },
        include: { shop: { select: { name: true } } }
    });
};

export const getInstallmentDueReport = async (filters: any = {}) => {
    const { phone, cnic, shopId } = filters;
    const where: any = {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        dueDate: { lte: new Date() },
        plan: {
            sale: shopId ? { shopId } : {}
        }
    };

    if (phone || cnic) {
        where.plan = {
            sale: {
                customer: {
                    AND: [
                        phone ? { phone: { contains: phone } } : {},
                        cnic ? { cnic: { contains: cnic } } : {}
                    ]
                }
            }
        };
    }

    return await prisma.installment.findMany({
        where,
        include: {
            plan: {
                include: {
                    sale: { include: { customer: true } }
                }
            }
        },
        orderBy: { dueDate: 'asc' }
    });
};

export const getCustomerInstallmentSummary = async (filters: any = {}) => {
    const { phone, cnic, shopId } = filters;
    const customerWhere: any = { isActive: true };
    if (phone) customerWhere.phone = { contains: phone };
    if (cnic) customerWhere.cnic = { contains: cnic };
    if (shopId) customerWhere.shopId = shopId;

    const customers = await prisma.customer.findMany({
        where: {
            ...customerWhere,
            sales: {
                some: {
                    saleType: 'INSTALLMENT'
                }
            }
        },
        include: {
            sales: {
                where: { saleType: 'INSTALLMENT' },
                include: {
                    installmentPlan: {
                        include: { installments: true }
                    }
                }
            }
        }
    });

    return customers.map(c => {
        let totalItems = 0;
        let totalPaid = 0;
        let totalRemaining = 0;
        let totalDue = 0;

        c.sales.forEach(s => {
            if (s.installmentPlan) {
                totalItems++;
                s.installmentPlan.installments.forEach(inst => {
                    const amount = Number(inst.amount);
                    const paid = Number(inst.paidAmount);
                    totalPaid += paid;
                    totalRemaining += (amount - paid);
                    if (inst.status !== 'PAID' && new Date(inst.dueDate) <= new Date()) {
                        totalDue += (amount - paid);
                    }
                });
            }
        });

        return {
            name: c.name,
            totalItems,
            totalPaid,
            remainingBalance: totalRemaining,
            dueAmount: totalDue
        };
    });
};
