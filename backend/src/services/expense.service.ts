import pool from '../utils/db';

export const createExpense = async (data: any) => {
    const { description, amount, category, shopId, date, userId } = data;
    const [result]: any = await pool.query(
        'INSERT INTO expense (description, amount, category, shopId, date, userId) VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)',
        [description, amount, category || null, shopId, date || null, userId || null]
    );
    const [rows]: any = await pool.query('SELECT * FROM expense WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllExpenses = async (filters: any) => {
    const { startDate, endDate, shopId, search } = filters;
    let query = `
        SELECT e.*, s.name as shopName
        FROM expense e
        LEFT JOIN shop s ON e.shopId = s.id
        WHERE e.isActive = 1
    `;
    const params: any[] = [];

    if (shopId) {
        query += ' AND e.shopId = ?';
        params.push(shopId);
    }

    if (startDate) {
        query += ' AND e.date >= ?';
        params.push(new Date(startDate));
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query += ' AND e.date <= ?';
        params.push(end);
    }

    if (search) {
        query += ' AND (e.description LIKE ? OR e.category LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    query += ' ORDER BY e.date DESC';

    const [rows]: any = await pool.query(query, params);
    return rows.map((row: any) => {
        const { shopName, ...expenseData } = row;
        if (shopName) expenseData.shop = { name: shopName };
        return expenseData;
    });
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
    await pool.query('UPDATE expense SET isActive = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM expense WHERE id = ?', [id]);
    return rows[0];
};
