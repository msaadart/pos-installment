import pool from '../utils/db';
import * as fs from 'fs';
import * as path from 'path';

// --- Category Services ---
export const createCategory = async (data: any) => {
    const [result]: any = await pool.query(
        'INSERT INTO category (name, shopId) VALUES (?, ?)',
        [data.name, data.shopId || null]
    );
    const [rows]: any = await pool.query('SELECT * FROM category WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllCategories = async (shopId?: number) => {
    let query = 'SELECT * FROM category WHERE isActive = 1';
    const params: any[] = [];
    if (shopId) {
        query += ' AND (shopId = ? OR shopId IS NULL)';
        params.push(shopId);
    }
    const [rows]: any = await pool.query(query, params);
    return rows;
};

// --- Brand Services ---
export const createBrand = async (data: any) => {
    const [result]: any = await pool.query(
        'INSERT INTO brand (name) VALUES (?)',
        [data.name]
    );
    const [rows]: any = await pool.query('SELECT * FROM brand WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllBrands = async () => {
    const [rows]: any = await pool.query('SELECT * FROM brand WHERE isActive = 1');
    return rows;
};

// --- Product Services ---
export const createProduct = async (data: any) => {
    const { image, name, sku, barcode, description, price, costPrice, stock, minStock, shopId, categoryId, brandId } = data;

    let imageUrl = null;
    if (image) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `${Date.now()}-${sku || 'product'}.png`;
        const uploadsPath = path.join(process.cwd(), 'uploads', 'products');

        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }

        const filePath = path.join(uploadsPath, fileName);
        fs.writeFileSync(filePath, base64Data, 'base64');
        imageUrl = `/uploads/products/${fileName}`;
    }

    const [result]: any = await pool.query(
        `INSERT INTO product 
        (name, sku, barcode, description, price, costPrice, stock, minStock, shopId, categoryId, brandId, imageUrl) 
        VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, 0), COALESCE(?, 5), ?, ?, ?, ?)`,
        [name, sku, barcode || null, description || null, price, costPrice, stock, minStock, shopId, categoryId || null, brandId || null, imageUrl]
    );

    const [rows]: any = await pool.query('SELECT * FROM product WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllProducts = async (filters: any = {}) => {
    const { search, shopId } = filters;
    let query = `
        SELECT p.*, 
            c.name as categoryName, 
            b.name as brandName,
            s.name as shopName
        FROM product p
        LEFT JOIN category c ON p.categoryId = c.id
        LEFT JOIN brand b ON p.brandId = b.id
        LEFT JOIN shop s ON p.shopId = s.id
        WHERE p.isActive = 1
    `;
    const params: any[] = [];

    if (shopId) {
        query += ' AND p.shopId = ?';
        params.push(shopId);
    }

    if (search) {
        query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }

    query += ' ORDER BY p.name ASC LIMIT 200';

    const [rows]: any = await pool.query(query, params);

    return rows.map((row: any) => {
        const { categoryName, brandName, shopName, ...productData } = row;
        if (categoryName) productData.category = { name: categoryName };
        if (brandName) productData.brand = { name: brandName };
        if (shopName) productData.shop = { name: shopName };
        return productData;
    });
};

export const getProductById = async (id: number) => {
    const [rows]: any = await pool.query(`
        SELECT p.*, 
            c.id as c_id, c.name as c_name, 
            b.id as b_id, b.name as b_name,
            s.id as s_id, s.name as s_name 
        FROM product p
        LEFT JOIN category c ON p.categoryId = c.id
        LEFT JOIN brand b ON p.brandId = b.id
        LEFT JOIN shop s ON p.shopId = s.id
        WHERE p.id = ? AND p.isActive = 1
    `, [id]);

    if (rows.length === 0) return null;

    const row = rows[0];
    const { c_id, c_name, b_id, b_name, s_id, s_name, ...productData } = row;

    if (c_id) productData.category = { id: c_id, name: c_name };
    if (b_id) productData.brand = { id: b_id, name: b_name };
    if (s_id) productData.shop = { id: s_id, name: s_name };

    return productData;
};

export const updateProduct = async (id: number, data: any) => {
    const keys = Object.keys(data);
    if (keys.length === 0) {
        const [rows]: any = await pool.query('SELECT * FROM product WHERE id = ?', [id]);
        return rows[0];
    }
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => data[k]);
    values.push(id);

    await pool.query(`UPDATE product SET ${setClause} WHERE id = ?`, values);
    const [rows]: any = await pool.query('SELECT * FROM product WHERE id = ?', [id]);
    return rows[0];
};

export const deleteProduct = async (id: number) => {
    await pool.query('UPDATE product SET isActive = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM product WHERE id = ?', [id]);
    return rows[0];
};
