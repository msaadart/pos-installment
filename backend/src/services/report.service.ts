import prisma from '../utils/prisma';

export const getDashboardStats = async (filters: any = {}) => {
    const { shopId } = filters;
    const where = shopId ? { shopId } : {};

    const totalSales = await prisma.sale.aggregate({
        where,
        _sum: { totalAmount: true }
    });
    const totalProducts = await prisma.product.count({ where });
    const totalUsers = await prisma.user.count({ where });
    const totalShops = await prisma.shop.count(); // Shops count is usually global

    // Recent Sales
    const recentSales = await prisma.sale.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
    });

    const activeInstallmentsCount = await prisma.installmentPlan.count({
        where: {
            status: 'ACTIVE',
            sale: where
        }
    });

    return {
        totalSales: Number(totalSales._sum.totalAmount) || 0,
        totalProducts,
        totalUsers,
        totalShops,
        activeInstallmentsCount,
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
        orderBy: { createdAt: 'desc' }
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
