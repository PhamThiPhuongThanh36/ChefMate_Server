const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectDB() {
    try {
        const connection = await pool.getConnection();
        connection.release();
        console.log('Đã kết nối MySQL');
    } catch (err) {
        console.error('Lỗi kết nối MySQL:', err);
        process.exit(1);
    }
}

module.exports = { pool, connectDB };