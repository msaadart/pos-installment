import pool from '../utils/db';

export const createCustomer = async (data: any) => {
    const { name, phone, address, cnic, balance, creditLimit, shopId } = data;
    const [result]: any = await pool.query(
        'INSERT INTO customer (name, phone, address, cnic, balance, creditLimit, shopId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, phone, address || null, cnic || null, balance || 0, creditLimit || 0, shopId || null]
    );
    const [rows]: any = await pool.query('SELECT * FROM customer WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllCustomers = async (filters: any = {}) => {
    const { search, shopId, limit } = filters;
    let query = 'SELECT * FROM customer WHERE isActive = 1';
    const params: any[] = [];

    if (shopId) {
        query += ' AND shopId = ?';
        params.push(shopId);
    }

    if (search) {
        query += ' AND (name LIKE ? OR phone LIKE ? OR cnic LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY name ASC LIMIT 200';

    const [rows]: any = await pool.query(query, params);
    return rows;
};

export const getCustomerById = async (id: number) => {
    const [rows]: any = await pool.query('SELECT * FROM customer WHERE id = ? AND isActive = 1 LIMIT 1', [id]);
    return rows.length > 0 ? rows[0] : null;
};

export const updateCustomer = async (id: number, data: any) => {
    const keys = Object.keys(data);
    if (keys.length === 0) {
        const [rows]: any = await pool.query('SELECT * FROM customer WHERE id = ?', [id]);
        return rows[0];
    }
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => data[k]);
    values.push(id);

    await pool.query(`UPDATE customer SET ${setClause} WHERE id = ?`, values);
    const [rows]: any = await pool.query('SELECT * FROM customer WHERE id = ?', [id]);
    return rows[0];
};

export const deleteCustomer = async (id: number) => {
    await pool.query('UPDATE customer SET isActive = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM customer WHERE id = ?', [id]);
    return rows[0];
};
