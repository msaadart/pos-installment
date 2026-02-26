import prisma from '../utils/prisma';
import { createSale } from './sale.service';

export const createInstallmentPlan = async (data: any) => {
    const { saleId, totalAmount, downPayment, totalInstallments, startDate, monthlyInstallment, shopId } = data;

    // 1. Create Plan
    const plan = await prisma.installmentPlan.create({
        data: {
            saleId,
            totalAmount,
            downPayment,
            monthlyInstallment,
            totalInstallments,
            startDate: new Date(startDate),
            status: 'ACTIVE',
            shopId: shopId || 1
        } as any
    });

    // 2. Generate Installments
    const installments = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= totalInstallments; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        installments.push({
            planId: plan.id,
            dueDate: new Date(currentDate),
            amount: monthlyInstallment,
            status: 'PENDING'
        });
    }

    await prisma.installment.createMany({ data: installments as any });

    return prisma.installmentPlan.findUnique({
        where: { id: plan.id },
        include: { installments: true }
    });
};

export const createInstallmentSale = async (data: any) => {
    const { saleData, planData } = data;
    saleData.saleType = 'INSTALLMENT';
    saleData.status = 'COMPLETED';
    const sale = await createSale(saleData);
    planData.saleId = sale.id;
    planData.shopId = sale.shopId;
    const plan = await createInstallmentPlan(planData);
    return { sale, plan };
};

export const getInstallmentPlans = async (filters: any = {}) => {
    const { shopId, status, search, phone, cnic } = filters;
    const where: any = {};

    if (shopId) where.shopId = Number(shopId);
    if (status) where.status = status;

    if (search || phone || cnic) {
        where.sale = {
            customer: {
                OR: [
                    search ? { name: { contains: search } } : {},
                    phone ? { phone: { contains: phone } } : {},
                    cnic ? { cnic: { contains: cnic } } : {}
                ].filter(o => Object.keys(o).length > 0)
            },
            items: {
                some: {}
            }
        };
    }

    return await prisma.installmentPlan.findMany({
        where,
        include: {
            sale: { include: { customer: true, items: true } },
            installments: true
        },
        orderBy: { createdAt: 'desc' },
        take: 200
    });
};

export const payInstallment = async (id: number, amount: number, paymentMethod: string = 'CASH', referenceId?: string) => {
    const installment = await prisma.installment.findUnique({ where: { id }, include: { plan: true } });
    if (!installment) throw new Error('Installment not found');

     if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    const paidAmount = Number(installment.paidAmount) + amount;
    let status = 'PARTIALLY_PAID';
    if (paidAmount >= Number(installment.amount)) {
        status = 'PAID';
    }

    const updatedInstallment = await prisma.installment.update({
        where: { id },
        data: {
            paidAmount,
            status: status as any,
            paidAt: new Date(),
            paymentMethod: paymentMethod as any,
            referenceId
        } as any
    });

    const unpaidCount = await prisma.installment.count({
        where: {
            planId: installment?.planId,
            status: {
                not: 'PAID'
            }
        }
    });

    if (unpaidCount === 0) {
        await prisma.installmentPlan.update({
            where: { id: installment.planId },
            data: {
                status: 'COMPLETED',
                endDate: new Date()
            }
        });
    }

    return updatedInstallment;

};
