import pool from '../utils/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from "mysql2";

export const createUser = async (data: any) => {
    const { email, password, name, role, shopId } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
        'INSERT INTO user (email, password, name, role, shopId) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, name, role, shopId || null]
    );

    const [rows]: any = await pool.query('SELECT * FROM user WHERE id = ?', [result.insertId]);
    return rows[0];
};

export const getAllUsers = async (filters: any) => {
    const query = `
        SELECT u.*, s.name as shopName 
        FROM user u 
        LEFT JOIN shop s ON u.shopId = s.id 
        WHERE u.isActive = 1
    `;

    const [rows] = await pool.query<UserRow[]>(query);

    return rows.map(({ shopName, ...userData }) => {
        return {
            ...userData,
            shop: shopName ? { name: shopName } : null
        };
    });
};

export const getUserById = async (id: number) => {
    const [rows]: any = await pool.query(`
        SELECT u.*, 
            s.id as s_id, s.name as s_name, s.address as s_address, 
            s.contact as s_contact, s.isActive as s_isActive, 
            s.createdAt as s_createdAt, s.updatedAt as s_updatedAt
        FROM User u 
        LEFT JOIN Shop s ON u.shopId = s.id 
        WHERE u.id = ? AND u.isActive = 1
    `, [id]);

    if (rows.length === 0) return null;

    const row = rows[0];
    const { s_id, s_name, s_address, s_contact, s_isActive, s_createdAt, s_updatedAt, ...userData } = row;

    if (s_id) {
        userData.shop = {
            id: s_id, name: s_name, address: s_address, contact: s_contact,
            isActive: s_isActive, createdAt: s_createdAt, updatedAt: s_updatedAt
        };
    }

    return userData;
};

export const updateUser = async (id: number, data: any) => {
    let updateData = { ...data };

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const keys = Object.keys(updateData);
    if (keys.length === 0) {
        const [rows]: any = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        return rows[0];
    }

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => updateData[key]);
    values.push(id);

    await pool.query(`UPDATE user SET ${setClause} WHERE id = ?`, values);

    const [rows]: any = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
    return rows[0];
};

export const deleteUser = async (id: number) => {
    await pool.query('UPDATE user SET isActive = 0 WHERE id = ?', [id]);
    const [rows]: any = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
    return rows[0];
};

export interface UserRow extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    shopId: number | null;
    isActive: number;
    shopName: string | null;
}
