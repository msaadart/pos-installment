import pool from '../utils/db';

export const createSale = async (data: any) => {
    const { shopId, userId, customerId, items, discount, paymentMethod, saleType, paidAmount, referenceId } = data;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Check if customer is active
        if (customerId) {
            const [customers]: any = await connection.query('SELECT isActive FROM customer WHERE id = ?', [customerId]);
            if (customers.length === 0) throw new Error('Customer not found');
            if (customers[0].isActive === 0) throw new Error('Cannot make a sale to an inactive customer');
        }

        // Calculate totals and verify stock
        let totalAmount = 0;
        for (const item of items) {
            const [products]: any = await connection.query('SELECT name, stock FROM product WHERE id = ?', [item.productId]);
            if (products.length === 0) throw new Error(`Product ${item.productId} not found`);
            if (products[0].stock < item.quantity) throw new Error(`Insufficient stock for ${products[0].name}`);
            totalAmount += Number(item.price) * item.quantity;
        }

        const netAmount = totalAmount - (discount || 0);
        const balance = netAmount - (paidAmount || 0);
        const invoiceNo = `INV-${Date.now()}`;

        // 1. Create Sale Record
        const [saleResult]: any = await connection.query(
            `INSERT INTO sale 
            (invoiceNo, totalAmount, discount, netAmount, paidAmount, balance, status, paymentMethod, saleType, shopId, userId, customerId, referenceId) 
            VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?, ?, ?, ?, ?)`,
            [invoiceNo, totalAmount, discount || 0, netAmount, paidAmount || 0, balance, paymentMethod || 'CASH', saleType || 'CASH', shopId, userId, customerId || null, referenceId || null]
        );
        const saleId = saleResult.insertId;

        // 2. Create Sale Items and Update Inventory
        for (const item of items) {
            const subtotal = Number(item.price) * item.quantity;
            await connection.query(
                `INSERT INTO saleitem (saleId, productId, quantity, price, discount, subtotal) VALUES (?, ?, ?, ?, 0, ?)`,
                [saleId, item.productId, item.quantity, item.price, subtotal]
            );

            await connection.query(
                `UPDATE product SET stock = stock - ? WHERE id = ?`,
                [item.quantity, item.productId]
            );
        }

        // 3. Handle Installment Plan
        if (saleType === 'INSTALLMENT') {
            const { downPayment, duration } = data;
            if (!customerId) throw new Error('Customer is required for installment sales');
            if (!duration || duration <= 0) throw new Error('Duration is required for installment sales');

            const remainingAmount = netAmount - (downPayment || 0);
            const monthlyAmount = remainingAmount / duration;

            const [planResult]: any = await connection.query(
                `INSERT INTO installmentplan 
                (saleId, totalAmount, downPayment, monthlyInstallment, totalInstallments, startDate, status, shopId) 
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'ACTIVE', ?)`,
                [saleId, netAmount, downPayment || 0, monthlyAmount, duration, shopId || 1]
            );
            const planId = planResult.insertId;

            // Generate Installments
            let dueDate = new Date();
            for (let i = 1; i <= duration; i++) {
                dueDate.setMonth(dueDate.getMonth() + 1);
                await connection.query(
                    `INSERT INTO installment (planId, dueDate, amount, status) VALUES (?, ?, ?, 'PENDING')`,
                    [planId, new Date(dueDate), monthlyAmount]
                );
            }
        }

        //add expense and income record
        await connection.query(
                'INSERT INTO expense (description, amount, category, shopId, userId, type, paymentMethod, referenceId, allowDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [invoiceNo, paidAmount, 'sale ' + saleType, shopId, userId || null, 'INCOME', paymentMethod || 'CASH', referenceId || null, 0]
        );

        await connection.commit();

        const [sales]: any = await connection.query('SELECT * FROM sale WHERE id = ?', [saleId]);
        const [saleItems]: any = await connection.query('SELECT * FROM saleitem WHERE saleId = ?', [saleId]);

        return { ...sales[0], items: saleItems };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const getAllSales = async (filters: any) => {
    let query = `
        SELECT s.*, u.name as userName, c.name as customerName
        FROM sale s
        LEFT JOIN user u ON s.userId = u.id
        LEFT JOIN customer c ON s.customerId = c.id
        WHERE 1=1
    `;
    const params: any[] = [];

    query += ' ORDER BY s.createdAt DESC LIMIT 200';

    const [rows]: any = await pool.query(query, params);
    return rows.map((row: any) => {
        const { userName, customerName, ...saleData } = row;
        return {
            ...saleData,
            user: userName ? { name: userName } : null,
            customer: customerName ? { name: customerName } : null,
            items: []
        };
    });
};

export const getSaleById = async (id: number) => {
    const [sales]: any = await pool.query(`
        SELECT s.*, u.name as userName, c.name as customerName, sh.name as shopName
        FROM sale s
        LEFT JOIN user u ON s.userId = u.id
        LEFT JOIN customer c ON s.customerId = c.id
        LEFT JOIN shop sh ON s.shopId = sh.id
        WHERE s.id = ?
    `, [id]);

    if (sales.length === 0) return null;
    const sale = sales[0];

    const [items]: any = await pool.query(`
        SELECT si.*, p.name as productName
        FROM saleitem si
        LEFT JOIN product p ON si.productId = p.id
        WHERE si.saleId = ?
    `, [id]);

    const mappedItems = items.map((item: any) => {
        const { productName, ...itemData } = item;
        return { ...itemData, product: { name: productName } };
    });

    const { userName, customerName, shopName, ...saleData } = sale;
    return {
        ...saleData,
        user: userName ? { name: userName } : null,
        customer: customerName ? { name: customerName } : null,
        shop: shopName ? { name: shopName } : null,
        items: mappedItems
    };
};
