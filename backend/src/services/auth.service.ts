import pool from '../utils/db';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils';

export const registerUser = async (data: any) => {
    const { email, password, name, role, shopId } = data;

    const [existingUsers]: any = await pool.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        throw new Error('user already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
        'INSERT INTO user (email, password, name, role, shopId) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, name, role || 'SALES_USER', shopId || null]
    );

    const [rows]: any = await pool.query('SELECT * FROM user WHERE id = ?', [result.insertId]);
    const user = rows[0];

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;

    const [rows]: any = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new Error('Invalid email or password');
    }
    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, shopId: user.shopId });
    return { user, token };
};
