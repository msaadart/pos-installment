import prisma from '../utils/prisma';
import { createSale } from './sale.service';

export const createInstallmentPlan = async (data: any) => {
    const { saleId, totalAmount, downPayment, totalInstallments, interestRate, startDate, monthlyInstallment } = data;

    // 1. Create Plan
    const plan = await prisma.installmentPlan.create({
        data: {
            saleId,
            totalAmount,
            downPayment,
            monthlyInstallment,
            totalInstallments,
            interestRate: interestRate || 0,
            startDate: new Date(startDate),
            status: 'ACTIVE'
        }
    });

    // 2. Generate Installments
    const installments = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= totalInstallments; i++) {
        // Add 1 month for next due date
        currentDate.setMonth(currentDate.getMonth() + 1);

        installments.push({
            planId: plan.id,
            dueDate: new Date(currentDate),
            amount: monthlyInstallment,
            status: 'PENDING'
        });
    }

    await prisma.installment.createMany({ data: installments as any }); // Type cast for createMany

    return prisma.installmentPlan.findUnique({
        where: { id: plan.id },
        include: { installments: true }
    });
};

export const createInstallmentSale = async (data: any) => {
    const { saleData, planData } = data;

    // 1. Create Sale (Installment Type)
    saleData.saleType = 'INSTALLMENT';
    saleData.status = 'COMPLETED'; // Sale is done, payment is pending
    const sale = await createSale(saleData);

    // 2. Create Plan attached to Sale
    planData.saleId = sale.id;
    const plan = await createInstallmentPlan(planData);

    return { sale, plan };
};

export const getInstallmentPlans = async (filters: any = {}) => {
    const { phone, cnic } = filters;
    const where: any = {};

    if (phone) {
        where.sale = { customer: { phone: { contains: phone } } };
    }
    if (cnic) {
        if (where.sale) {
            where.sale.customer.cnic = { contains: cnic };
        } else {
            where.sale = { customer: { cnic: { contains: cnic } } };
        }
    }

    return await prisma.installmentPlan.findMany({
        where,
        include: {
            sale: { include: { customer: true, items: { include: { product: true } } } },
            installments: true
        }
    });
};

export const payInstallment = async (id: number, amount: number, paymentMethod: string = 'CASH', referenceId?: string) => {
    const installment = await prisma.installment.findUnique({ where: { id } });
    if (!installment) throw new Error('Installment not found');

    const paidAmount = Number(installment.paidAmount) + amount;
    let status = 'PARTIALLY_PAID';
    if (paidAmount >= Number(installment.amount)) {
        status = 'PAID';
    }

    return await prisma.installment.update({
        where: { id },
        data: {
            paidAmount,
            status: status as any,
            paidAt: new Date(),
            paymentMethod: paymentMethod as any,
            referenceId
        } as any
    });
};
