import pool from '../utils/db';

export const createShop = async (data: any) => {
    const { name, address, contact } = data;
    const [result]: any = await pool.query(
        'INSERT INTO shop (name, address, contact) VALUES (?, ?, ?)',
        [name, address, contact]
    );
    const [rows]: any = await pool.query('SELECT * FROM shop WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllShops = async () => {
    const [shops]: any = await pool.query('SELECT * FROM shop WHERE isActive = 1');
    const [users]: any = await pool.query('SELECT id, name, email, role, shopId FROM user WHERE isActive = 1');

    return shops.map((shop: any) => ({
        ...shop,
        users: users.filter((u: any) => u.shopId === shop.id)
    }));
};

export const getShopById = async (id: number) => {
    const [shops]: any = await pool.query('SELECT * FROM shop WHERE id = ? AND isActive = 1', [id]);
    if (shops.length === 0) return null;
    const shop = shops[0];

    const [users]: any = await pool.query('SELECT * FROM user WHERE shopId = ? AND isActive = 1', [id]);
    const [products]: any = await pool.query('SELECT * FROM product WHERE shopId = ? AND isActive = 1', [id]);

    return { ...shop, users, products };
};

export const updateShop = async (id: number, data: any) => {
    const keys = Object.keys(data);
    if (keys.length === 0) {
        const [rows]: any = await pool.query('SELECT * FROM shop WHERE id = ?', [id]);
        return rows[0];
    }
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => data[k]);
    values.push(id);

    await pool.query(`UPDATE shop SET ${setClause} WHERE id = ?`, values);
    const [rows]: any = await pool.query('SELECT * FROM shop WHERE id = ?', [id]);
    return rows[0];
};

export const deleteShop = async (id: number) => {
    await pool.query('UPDATE shop SET isActive = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM shop WHERE id = ?', [id]);
    return rows[0];
};
