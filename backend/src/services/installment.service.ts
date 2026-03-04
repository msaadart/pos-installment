import pool from '../utils/db';
import { createSale } from './sale.service';

export const createInstallmentPlan = async (data: any) => {
    const { saleId, totalAmount, downPayment, totalInstallments, startDate, monthlyInstallment, shopId } = data;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Plan
        const [planResult]: any = await connection.query(
            `INSERT INTO installmentplan 
            (saleId, totalAmount, downPayment, monthlyInstallment, totalInstallments, startDate, status, shopId) 
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
            [saleId, totalAmount, downPayment, monthlyInstallment, totalInstallments, new Date(startDate), shopId || 1]
        );
        const planId = planResult.insertId;

        // 2. Generate Installments
        let currentDate = new Date(startDate);
        for (let i = 1; i <= totalInstallments; i++) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            await connection.query(
                `INSERT INTO installment (planId, dueDate, amount, status) VALUES (?, ?, ?, 'PENDING')`,
                [planId, new Date(currentDate), monthlyInstallment]
            );
        }

        await connection.commit();

        const [plans]: any = await pool.query('SELECT * FROM installmentplan WHERE id = ?', [planId]);
        const [installments]: any = await pool.query('SELECT * FROM installment WHERE planId = ?', [planId]);

        return { ...plans[0], installments };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
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
    let query = `
        SELECT ip.*, 
            s.invoiceNo as saleInvoiceNo,
            c.name as customerName, c.phone as customerPhone, c.cnic as customerCnic
        FROM installmentplan ip
        LEFT JOIN sale s ON ip.saleId = s.id
        LEFT JOIN customer c ON s.customerId = c.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (shopId) {
        query += ' AND ip.shopId = ?';
        params.push(Number(shopId));
    }
    if (status) {
        query += ' AND ip.status = ?';
        params.push(status);
    }
    if (search || phone || cnic) {
        query += ' AND (';
        const orConditions = [];
        if (search) {
            orConditions.push('c.name LIKE ?');
            params.push(`%${search}%`);
        }
        if (phone) {
            orConditions.push('c.phone LIKE ?');
            params.push(`%${phone}%`);
        }
        if (cnic) {
            orConditions.push('c.cnic LIKE ?');
            params.push(`%${cnic}%`);
        }
        if (orConditions.length > 0) {
            query += orConditions.join(' OR ') + ')';
        } else {
            query = query.replace(' AND (', '');
        }
    }

    query += ' ORDER BY ip.createdAt DESC LIMIT 200';

    const [plans]: any = await pool.query(query, params);

    // Fetch installments for these plans
    if (plans.length > 0) {
        const planIds = plans.map((p: any) => p.id);
        const [installments]: any = await pool.query(
            `SELECT * FROM installment WHERE planId IN (${planIds.map(() => '?').join(',')})`,
            planIds
        );

        return plans.map((plan: any) => {
            const { saleInvoiceNo, customerName, customerPhone, customerCnic, ...planData } = plan;
            return {
                ...planData,
                sale: {
                    invoiceNo: saleInvoiceNo,
                    customer: customerName ? { name: customerName, phone: customerPhone, cnic: customerCnic } : null
                },
                installments: installments.filter((i: any) => i.planId === plan.id)
            };
        });
    }
    return [];
};

export const payInstallment = async (id: number, amount: number, paymentMethod: string = 'CASH', referenceId?: string) => {
    if (amount <= 0) throw new Error('Amount must be greater than 0');

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [installments]: any = await connection.query('SELECT * FROM installment WHERE id = ?', [id]);
        if (installments.length === 0) throw new Error('installment not found');
        const installment = installments[0];

        const paidAmount = Number(installment.paidAmount) + amount;
        let status = 'PARTIALLY_PAID';
        if (paidAmount >= Number(installment.amount)) {
            status = 'PAID';
        }

        await connection.query(
            `UPDATE installment SET paidAmount = ?, status = ?, paidAt = CURRENT_TIMESTAMP, paymentMethod = ?, referenceId = ? WHERE id = ?`,
            [paidAmount, status, paymentMethod, referenceId || null, id]
        );

        const [unpaidCount]: any = await connection.query(
            `SELECT COUNT(*) as count FROM installment WHERE planId = ? AND status != 'PAID'`,
            [installment.planId]
        );

        if (unpaidCount[0].count === 0) {
            await connection.query(
                `UPDATE installmentplan SET status = 'COMPLETED', endDate = CURRENT_TIMESTAMP WHERE id = ?`,
                [installment.planId]
            );
        }

        await connection.commit();

        const [updatedInstallment]: any = await pool.query('SELECT * FROM installment WHERE id = ?', [id]);
        return updatedInstallment[0];
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
