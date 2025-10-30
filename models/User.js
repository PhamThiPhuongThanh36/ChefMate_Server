const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM Users');
        return rows;
    }

    static async register(userData) {
        const { fullName, phone, email, password } = userData;
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO Users (fullName, phone, email, passwordHash) VALUES (?, ?, ?, ?)',
            [fullName, phone, email, passwordHash]
        );
        const userId = result.insertId;
        const [rows] = await pool.query(
            'SELECT userId, fullName, phone, email FROM Users WHERE userId = ?',
            [userId]
        )
        return rows[0];
    }

    static async login(identifier, password) {
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE phone = ? OR email = ?',
            [identifier, identifier]
        );
        if (rows.length === 0) return null;
        const user = rows[0];
        const match = await bcrypt.compare(password, user.passwordHash);
        return match ? user : null;
    }

    static async changePassword(userId, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE Users SET passwordHash = ? WHERE userId = ?',
            [passwordHash, userId]
        );
    }

    static async updateProfile(userId, updates) {
        const { fullName, phone, email } = updates;
        await pool.query(
            'UPDATE Users SET fullName = ?, phone = ?, email = ? WHERE userId = ?',
            [fullName, phone, email, userId]
        );
    }
}

module.exports = User;