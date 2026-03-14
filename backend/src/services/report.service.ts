import pool from '../utils/db';

export const getDashboardStats = async (filters: any = {}) => {
    const { shopId, startDate } = filters;

    const buildFilters = (table?: string, dateColumn: string = 'createdAt') => {
        let conditions = ' WHERE 1=1 ';
        const params: any[] = [];

         if (shopId) {
            conditions += ` AND ${table ? table + '.' : ''}shopId = ?`;
            params.push(shopId);
        }

        if (startDate) {
            conditions += ` AND ${table ? table + '.' : ''}${dateColumn} >= ?`;
            params.push(new Date(startDate));
        }

        if (filters.endDate) {
            conditions += ` AND ${table ? table + '.' : ''}${dateColumn} <= ?`;
            params.push(new Date(filters.endDate));
        }

        return { conditions, params };
    };

    
    // Installment Plans
    const plansFilter = buildFilters('installmentplan');
    const plansQuery = `
        SELECT COUNT(*) as cnt 
        FROM installmentplan 
        ${plansFilter.conditions}
        AND status = 'ACTIVE'
    `;

    // Customers
    const custFilter = buildFilters('customer');
    const custQuery = `
        SELECT COUNT(*) as cnt 
        FROM customer 
        ${custFilter.conditions}
    `;

    // Sales Aggregate
    const salesFilter = buildFilters('sale');
    const salesAggQuery = `
        SELECT SUM(totalAmount) as total 
        FROM sale 
        ${salesFilter.conditions}
    `;

    // Expense Aggregate (uses different date column)
    const expenseFilter = buildFilters('expense', 'date');
    const expAggQuery = `
        SELECT SUM(amount) as total 
        FROM expense 
        ${expenseFilter.conditions}
        AND isActive = 1
    `;

    // Products (no date filter)
    const productFilter = buildFilters('product');
    const prodQuery = `
        SELECT COUNT(*) as cnt 
        FROM product 
        ${productFilter.conditions}
    `;

    // Users
    const userFilter = buildFilters('user');
    const userQuery = `
        SELECT COUNT(*) as cnt 
        FROM user 
        ${userFilter.conditions}
    `;

    // total received amount aggregate
    const recAggFilter = buildFilters('sale');
    const recAggQuery = `
        SELECT SUM(balance) as total 
        FROM sale 
        ${recAggFilter.conditions}
    `;

    // purchase
    const purchaseFilter = buildFilters('purchase');
    const purchaseQuery = `
        SELECT SUM(totalAmount) as total, SUM(paidAmount) as paid, SUM(balance) as balance
        FROM purchase 
        ${purchaseFilter.conditions}
    `;

    // Shops (no filters)
    const shopQuery = `SELECT COUNT(*) as cnt FROM shop`;

    // Recent Sales (with alias!)
    const recentFilter = buildFilters('s');
    const recentSalesQuery = `
        SELECT s.*, u.name as userName, c.name as customerName, c.phone as customerPhone, c.cnic as customerCnic 
        FROM sale s
        LEFT JOIN user u ON s.userId = u.id
        LEFT JOIN customer c ON s.customerId = c.id
        ${recentFilter.conditions}
        ORDER BY s.createdAt DESC 
        LIMIT 200
    `;

    const [
        [activeInstallments],
        [totalCustomers],
        [totalSalesAggregate],
        [totalExpensesAggregate],
        [totalProducts],
        [totalUsers],
        [totalShops],
        [recentSales],
        [totalRecivedAmountAggregate],
        [purchaseAggregate]
    ]: any = await Promise.all([
        pool.query(plansQuery, plansFilter.params),
        pool.query(custQuery, custFilter.params),
        pool.query(salesAggQuery, salesFilter.params),
        pool.query(expAggQuery, expenseFilter.params),
        pool.query(prodQuery, productFilter.params),
        pool.query(userQuery, userFilter.params),
        pool.query(shopQuery),
        pool.query(recentSalesQuery, recentFilter.params),
        pool.query(recAggQuery, recAggFilter.params),
        pool.query(purchaseQuery, purchaseFilter.params)
    ]);

    return {
        totalSales: Number(totalSalesAggregate[0]?.total) || 0,
        totalProducts: totalProducts[0]?.cnt || 0,
        totalUsers: totalUsers[0]?.cnt || 0,
        totalShops: totalShops[0]?.cnt || 0,
        activeInstallmentsCount: activeInstallments[0]?.cnt || 0,
        totalCustomers: totalCustomers[0]?.cnt || 0,
        totalExpenses: Number(totalExpensesAggregate[0]?.total) || 0,
        totalRecivedAmount: Number(totalRecivedAmountAggregate[0]?.total) || 0,
        purchase: purchaseAggregate.map((p: any) => ({
            total: Number(p.total) || 0,
            paid: Number(p.paid) || 0,
            balance: Number(p.balance) || 0
        }))[0],
        recentSales: recentSales.map((s: any) => ({
            ...s,
            user: { name: s.userName },
            customer: { name: s.customerName, phone: s.customerPhone, cnic: s.customerCnic },
        }))
    };
};

export const getSalesReport = async (filters: any) => {
    const { startDate, endDate, shopId } = filters;
    let query = `
        SELECT s.*, u.name as userName
        FROM sale s
        LEFT JOIN user u ON s.userId = u.id
        WHERE s.createdAt >= ? AND s.createdAt <= ?
    `;
    const params: any[] = [new Date(startDate), new Date(endDate)];

    if (shopId) {
        query += ' AND s.shopId = ?';
        params.push(shopId);
    }

    query += ' ORDER BY s.createdAt DESC LIMIT 200';

    const [rows]: any = await pool.query(query, params);
    return rows.map((r: any) => ({ ...r, user: { name: r.userName }, items: [] }));
};

export const getStockReport = async (filters: any = {}) => {
    const { shopId } = filters;
    let query = `
        SELECT p.*, s.name as shopName
        FROM product p
        LEFT JOIN shop s ON p.shopId = s.id
        WHERE p.stock <= 10
    `;
    const params: any[] = [];
    if (shopId) {
        query += ' AND p.shopId = ?';
        params.push(shopId);
    }

    const [rows]: any = await pool.query(query, params);
    return rows.map((r: any) => ({ ...r, shop: { name: r.shopName } }));
};

export const getInstallmentDueReport = async (filters: any = {}) => {
    const { phone, cnic, shopId } = filters;
    let query = `
        SELECT i.*, 
            ip.id as planId,
            c.name as customerName, c.phone as customerPhone, c.cnic as customerCnic
        FROM installment i
        JOIN installmentplan ip ON i.planId = ip.id
        JOIN sale s ON ip.saleId = s.id
        JOIN customer c ON s.customerId = c.id
        WHERE i.status IN ('PENDING', 'PARTIALLY_PAID') AND i.dueDate <= CURRENT_TIMESTAMP
    `;
    const params: any[] = [];

    if (shopId) {
        query += ' AND s.shopId = ?';
        params.push(shopId);
    }

    if (phone) {
        query += ' AND c.phone LIKE ?';
        params.push(`%${phone}%`);
    }

    if (cnic) {
        query += ' AND c.cnic LIKE ?';
        params.push(`%${cnic}%`);
    }

    query += ' ORDER BY i.dueDate ASC';

    const [rows]: any = await pool.query(query, params);
    return rows.map((r: any) => {
        const { planId, customerName, customerPhone, customerCnic, ...instData } = r;
        return {
            ...instData,
            plan: {
                id: planId,
                sale: {
                    customer: { name: customerName, phone: customerPhone, cnic: customerCnic }
                }
            }
        };
    });
};

export const getCustomerInstallmentSummary = async (filters: any = {}) => {
    const { phone, cnic, shopId } = filters;

    let query = `
        SELECT c.id, c.name, c.cnic, c.phone, c.address,
               ip.id as planId,
               i.amount, i.paidAmount, i.status, i.dueDate
        FROM customer c
        JOIN sale s ON s.customerId = c.id AND s.saleType = 'INSTALLMENT'
        JOIN installmentplan ip ON ip.saleId = s.id
        JOIN installment i ON i.planId = ip.id
        WHERE c.isActive = 1
    `;
    const params: any[] = [];

    if (phone) {
        query += ' AND c.phone LIKE ?';
        params.push(`%${phone}%`);
    }
    if (cnic) {
        query += ' AND c.cnic LIKE ?';
        params.push(`%${cnic}%`);
    }
    if (shopId) {
        query += ' AND c.shopId = ?';
        params.push(shopId);
    }

    const [rows]: any = await pool.query(query, params);

    const customersMap = new Map();
    rows.forEach((r: any) => {
        if (!customersMap.has(r.id)) {
            customersMap.set(r.id, {
                cnic: r.cnic,
                phone: r.phone,
                address: r.address,
                name: r.name,
                totalItems: new Set(),
                totalPaid: 0,
                remainingBalance: 0,
                dueAmount: 0
            });
        }

        const c = customersMap.get(r.id);
        c.totalItems.add(r.planId);

        const amount = Number(r.amount);
        const paid = Number(r.paidAmount);

        c.totalPaid += paid;
        c.remainingBalance += (amount - paid);

        if (r.status !== 'PAID' && new Date(r.dueDate) <= new Date()) {
            c.dueAmount += (amount - paid);
        }
    });

    const result: any[] = [];
    customersMap.forEach((val) => {
        result.push({
            cnic: val.cnic,
            phone: val.phone,
            address: val.address,
            name: val.name,
            totalItems: val.totalItems.size,
            totalPaid: val.totalPaid,
            remainingBalance: val.remainingBalance,
            dueAmount: val.dueAmount
        });
    });

    return result;
};
