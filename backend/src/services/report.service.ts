import prisma from '../utils/prisma';

export const getDashboardStats = async () => {
    const totalSales = await prisma.sale.aggregate({ _sum: { totalAmount: true } });
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();
    const totalShops = await prisma.shop.count();

    // Recent Sales
    const recentSales = await prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
    });

    const activeInstallmentsCount = await prisma.installmentPlan.count({
        where: { status: 'ACTIVE' }
    });

    return {
        totalSales: totalSales._sum.totalAmount || 0,
        totalProducts,
        totalUsers,
        totalShops,
        activeInstallmentsCount,
        recentSales
    };
};

export const getSalesReport = async (startDate: Date, endDate: Date) => {
    return await prisma.sale.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { items: true, user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const getStockReport = async () => {
    return await prisma.product.findMany({
        where: { stock: { lte: 10 } }, // Low stock query logic
        include: { shop: { select: { name: true } } }
    });
};

export const getInstallmentDueReport = async (filters: any = {}) => {
    const { phone, cnic } = filters;
    const where: any = {
        status: { in: ['PENDING', 'PARTIALLY_PAID'] },
        dueDate: { lte: new Date() }
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
    const { phone, cnic } = filters;
    const customerWhere: any = { isActive: true };
    if (phone) customerWhere.phone = { contains: phone };
    if (cnic) customerWhere.cnic = { contains: cnic };

    const customers = await prisma.customer.findMany({
        where: customerWhere,
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
