import prisma from '../utils/prisma';

export const createSale = async (data: any) => {
    const { shopId, userId, customerId, items, discount, paymentMethod, saleType, paidAmount } = data;

    // Check if customer is active
    if (customerId) {
        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) throw new Error('Customer not found');
        if (!customer.isActive) throw new Error('Cannot make a sale to an inactive customer');
    }

    // Calculate totals
    let totalAmount = 0;

    // Verify stock and calculate total
    for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        totalAmount += Number(product.price) * item.quantity;
    }

    const netAmount = totalAmount - (discount || 0);
    const balance = netAmount - (paidAmount || 0);
    const invoiceNo = `INV-${Date.now()}`;

    // Transaction: Create Sale, SaleItems, Update Inventory, Create InstallmentPlan
    const sale = await prisma.$transaction(async (prisma) => {
        // 1. Create Sale Record
        const newSale = await prisma.sale.create({
            data: {
                invoiceNo,
                shopId,
                userId,
                customerId: customerId || 3,
                totalAmount,
                discount: discount || 0,
                netAmount,
                paidAmount: paidAmount || 0,
                balance,
                paymentMethod,
                saleType,
                status: 'COMPLETED',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        subtotal: item.price * item.quantity
                    }))
                }
            },
            include: { items: true }
        });

        // 2. Update Inventory
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        // 3. Handle Installment Plan
        if (saleType === 'INSTALLMENT') {
            const { downPayment, duration } = data;
            if (!customerId) throw new Error('Customer is required for installment sales');
            if (!duration || duration <= 0) throw new Error('Duration is required for installment sales');

            const remainingAmount = netAmount - (downPayment || 0);
            const monthlyAmount = remainingAmount / duration;

            const plan = await prisma.installmentPlan.create({
                data: {
                    saleId: newSale.id,
                    totalAmount: netAmount,
                    downPayment: downPayment || 0,
                    monthlyInstallment: monthlyAmount,
                    totalInstallments: duration,
                    startDate: new Date(),
                    status: 'ACTIVE'
                }
            });

            // Generate Installments
            const installmentsData = [];
            for (let i = 1; i <= duration; i++) {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i);
                installmentsData.push({
                    planId: plan.id,
                    dueDate,
                    amount: monthlyAmount,
                    status: 'PENDING' as any
                });
            }

            await prisma.installment.createMany({
                data: installmentsData
            });
        }

        return newSale;
    });

    return sale;
};

export const getAllSales = async (filters: any) => {
    return await prisma.sale.findMany({
        where: filters,
        include: {
            items: { include: { product: true } },
            user: { select: { name: true } },
            customer: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getSaleById = async (id: number) => {
    return await prisma.sale.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            user: true,
            customer: true,
            shop: true
        }
    });
};
