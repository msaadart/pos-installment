import pool from '../utils/db';

export const createExpense = async (data: any) => {
    const { description, amount, category, shopId, date, userId, type, paymentMethod, referenceId, allowDeleted } = data;
    const [result]: any = await pool.query(
        'INSERT INTO expense (description, amount, category, shopId, date, userId, type, paymentMethod, referenceId, allowDeleted) VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?, ?, ?)',
        [description, amount, category || null, shopId, date || null, userId || null, type || 'EXPENSE', paymentMethod || 'CASH', referenceId || null, allowDeleted || 0]
    );
    const [rows]: any = await pool.query('SELECT * FROM expense WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllExpenses = async (filters: any) => {
    const { startDate, endDate, shopId, search, type = 'EXPENSE' } = filters;

    if (startDate && !endDate) {
        throw new Error('Please select end date');
    }

    if (!startDate && endDate) {
        throw new Error('Please select start date');
    }

    let baseQuery = `
        FROM expense e
        LEFT JOIN shop s ON e.shopId = s.id
        LEFT JOIN user u ON e.userId = u.id
        WHERE e.isActive = 1
    `;

    const params: any[] = [];

    if (shopId) {
        baseQuery += ' AND e.shopId = ?';
        params.push(shopId);
    }

    if (startDate) {
        baseQuery += ' AND e.date >= ?';
        params.push(new Date(startDate));
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        baseQuery += ' AND e.date <= ?';
        params.push(end);
    }

    if (type) {
        baseQuery += ' AND e.type = ?';
        params.push(type);
    }

    if (search) {
        baseQuery += ' AND (e.description LIKE ? OR e.category LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    // -------- GET DATA --------
    let dataQuery = `
        SELECT e.*, s.name as shopName, u.name as userName
        ${baseQuery}
        ORDER BY e.date DESC
    `;

    if (!startDate && !endDate) {
        dataQuery += ' LIMIT 200';
    }

    const [rows]: any = await pool.query(dataQuery, params);

    // -------- GET TOTAL EXPENSE --------
    const [totalRows]: any = await pool.query(
        `
        SELECT 
        SUM(CASE WHEN e.type='EXPENSE' THEN e.amount ELSE 0 END) AS totalExpense
        ${baseQuery}
        `,
        params
    );

    const totalExpense = totalRows[0]?.totalExpense || 0;

    const expenses = rows.map((row: any) => {
        const { shopName, userName, ...expenseData } = row;
        if (shopName) expenseData.shop = { name: shopName };
        if (userName) expenseData.user = { name: userName };
        return expenseData;
    });

    return {
        totalExpense,
        count: expenses.length,
        data: expenses
    };
};

export const getExpenseById = async (id: number) => {
    const [rows]: any = await pool.query(`
        SELECT e.*, s.name as shopName
        FROM expense e
        LEFT JOIN shop s ON e.shopId = s.id
        WHERE e.id = ? AND e.isActive = 1
    `, [id]);

    if (rows.length === 0) return null;
    const row = rows[0];
    const { shopName, ...expenseData } = row;
    if (shopName) expenseData.shop = { name: shopName };
    return expenseData;
};

export const deleteExpense = async (id: number) => {
    const [result]: any = await pool.query('UPDATE expense SET isActive = 0 WHERE id = ? AND allowDeleted = 1', [id]);
     if (result.affectedRows === 0) {
        throw new Error("This record is not allowed to be deleted");
    }
    const [rows]: any = await pool.query('SELECT * FROM expense WHERE id = ?', [id]);
    return rows[0];
};
