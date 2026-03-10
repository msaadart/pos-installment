import pool from '../utils/db';

export const createPurchase = async (data: any) => {
    const { shopId, userId, supplierId, items, totalAmount, paidAmount } = data;
    const balance = Number(totalAmount) - (Number(paidAmount) || 0);
    const invoiceNo = data.invoiceNo || `PUR-${Date.now()}`;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Purchase
        const [purchaseResult]: any = await connection.query(
            `INSERT INTO purchase 
            (invoiceNo, shopId, userId, supplierId, totalAmount, paidAmount, balance, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'COMPLETED')`,
            [invoiceNo, shopId, userId, supplierId, totalAmount, paidAmount || 0, balance]
        );
        const purchaseId = purchaseResult.insertId;

        // Create Items & Update Inventory
        for (const item of items) {
            const subtotal = Number(item.costPrice) * item.quantity;
            await connection.query(
                `INSERT INTO purchaseitem (purchaseId, productId, quantity, costPrice, subtotal) VALUES (?, ?, ?, ?, ?)`,
                [purchaseId, item.productId, item.quantity, item.costPrice, subtotal]
            );

            await connection.query(
                `UPDATE product SET stock = stock + ? WHERE id = ?`,
                [item.quantity, item.productId]
            );
        }

        // Update Supplier Balance
        if (balance > 0) {
            await connection.query(
                `UPDATE supplier SET balance = balance + ? WHERE id = ?`,
                [balance, supplierId]
            );
        }

        await connection.commit();

        const [purchases]: any = await pool.query('SELECT * FROM purchase WHERE id = ?', [purchaseId]);
        const [purchaseItems]: any = await pool.query('SELECT * FROM purchaseitem WHERE purchaseId = ?', [purchaseId]);
        return { ...purchases[0], items: purchaseItems };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const getAllPurchases = async (filters: any = {}) => {
    const { search, shopId, supplierId } = filters;
    let query = `
        SELECT p.*, pr.name as productName, pi.quantity as itemQuantity, pi.costPrice as itemCostPrice, s.name as supplierName, s.company as supplierCompany, s.phone as supplierPhone, sh.name as shopName 
        FROM purchase p
        LEFT JOIN supplier s ON p.supplierId = s.id
        LEFT JOIN shop sh ON p.shopId = sh.id
        LEFT JOIN purchaseitem pi ON p.id = pi.purchaseId
        LEFT JOIN product pr ON pi.productId = pr.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (shopId) {
        query += ' AND p.shopId = ?';
        params.push(shopId);
    }
    if (supplierId) {
        query += ' AND p.supplierId = ?';
        params.push(supplierId);
    }
    if (search) {
        query += ' AND (p.invoiceNo LIKE ? OR s.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.createdAt DESC LIMIT 200';

    const [rows]: any = await pool.query(query, params);
    return rows.map((row: any) => {
        const { supplierName, supplierCompany, supplierPhone, shopName, ...purchaseData } = row;
        return {
            ...purchaseData,
            supplier: { name: supplierName, company: supplierCompany, phone: supplierPhone },
            shop: { name: shopName }
        };
    });
};

export const getPurchaseById = async (id: number) => {
    const [purchases]: any = await pool.query(`
        SELECT p.*, s.name as supplierName, sh.name as shopName, u.name as userName
        FROM purchase p
        LEFT JOIN supplier s ON p.supplierId = s.id
        LEFT JOIN shop sh ON p.shopId = sh.id
        LEFT JOIN user u ON p.userId = u.id
        WHERE p.id = ?
    `, [id]);
    if (purchases.length === 0) return null;
    const purchase = purchases[0];

    const [items]: any = await pool.query(`
        SELECT pi.*, pr.name as productName
        FROM purchaseitem pi
        LEFT JOIN product pr ON pi.productId = pr.id
        WHERE pi.purchaseId = ?
    `, [id]);

    const mappedItems = items.map((item: any) => {
        const { productName, ...itemData } = item;
        return { ...itemData, product: { name: productName } };
    });

    const { supplierName, shopName, userName, ...purchaseData } = purchase;
    return {
        ...purchaseData,
        supplier: { name: supplierName },
        shop: { name: shopName },
        user: { name: userName },
        items: mappedItems
    };
};

export const createSupplier = async (data: any) => {
    const { name, phone, company, balance } = data;
    const [result]: any = await pool.query(
        'INSERT INTO supplier (name, phone, company, balance) VALUES (?, ?, ?, COALESCE(?, 0))',
        [name, phone || null, company || null, balance]
    );
    const [rows]: any = await pool.query('SELECT * FROM supplier WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllSuppliers = async (filters: any = {}) => {
    const { search } = filters;
    let query = 'SELECT * FROM supplier WHERE isActive = 1';
    const params: any[] = [];
    if (search) {
        query += ' AND (name LIKE ? OR company LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY name ASC LIMIT 200';
    const [rows]: any = await pool.query(query, params);
    return rows;
};

export const getSupplierById = async (id: number) => {
    const [suppliers]: any = await pool.query('SELECT * FROM supplier WHERE id = ? AND isActive = 1', [id]);
    if (suppliers.length === 0) return null;

    const [purchases]: any = await pool.query('SELECT * FROM purchase WHERE supplierId = ? ORDER BY createdAt DESC', [id]);
    return { ...suppliers[0], purchases };
};

export const deleteSupplier = async (id: number) => {
    await pool.query('UPDATE supplier SET isActive = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM supplier WHERE id = ?', [id]);
    return rows[0];
};

export const clearSupplierBalance = async (id: number) => {
    await pool.query('UPDATE supplier SET balance = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM supplier WHERE id = ?', [id]);
    return rows[0];
};

export const clearPurchaseBalance = async (purchaseId: number, amount: number, method: string, notes: string) => {
    if (amount <= 0) throw new Error('Amount must be greater than zero');

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [purchases]: any = await connection.query('SELECT * FROM purchase WHERE id = ?', [purchaseId]);
        if (purchases.length === 0) throw new Error('Purchase not found');
        const purchase = purchases[0];

        if (amount > purchase.balance) throw new Error('Amount exceeds purchase balance');

        const newPaidAmount = Number(purchase.paidAmount) + amount;
        const newBalance = Number(purchase.totalAmount) - newPaidAmount;

        // 1. Update Purchase
        await connection.query(
            'UPDATE purchase SET paidAmount = ?, balance = ? WHERE id = ?',
            [newPaidAmount, newBalance, purchaseId]
        );

        // 2. Update Supplier Balance
        await connection.query(
            'UPDATE supplier SET balance = balance - ? WHERE id = ?',
            [amount, purchase.supplierId]
        );

        // 3. Log Payment
        await connection.query(
            'INSERT INTO purchasepayment (purchaseId, supplierId, shopId, amount, method, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [purchaseId, purchase.supplierId, purchase.shopId, amount, method, notes || null]
        );

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const getAllPurchasePayments = async (filters: any = {}) => {
    const { supplierId, purchaseId, shopId } = filters;
    let query = `
        SELECT pp.*, s.name as supplierName, p.invoiceNo as purchaseInvoiceNo
        FROM purchasepayment pp
        LEFT JOIN supplier s ON pp.supplierId = s.id
        LEFT JOIN purchase p ON pp.purchaseId = p.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (supplierId) {
        query += ' AND pp.supplierId = ?';
        params.push(supplierId);
    }
    if (purchaseId) {
        query += ' AND pp.purchaseId = ?';
        params.push(purchaseId);
    }
    if (shopId) {
        query += ' AND pp.shopId = ?';
        params.push(shopId);
    }

    query += ' ORDER BY pp.createdAt DESC LIMIT 200';

    const [rows]: any = await pool.query(query, params);
    return rows.map((row: any) => {
        const { supplierName, purchaseInvoiceNo, ...paymentData } = row;
        return {
            ...paymentData,
            supplier: { name: supplierName },
            purchase: { invoiceNo: purchaseInvoiceNo }
        };
    });
};
