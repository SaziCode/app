// backend/models/db.js
const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');  // Конфігурація підключення

// Ініціалізація пулу підключень
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Функція для виконання запитів до бази даних
const query = async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
};

// Ініціалізація бази даних (створення таблиць, якщо вони не існують)
const initializeDatabase = async () => {
    const connection = await pool.getConnection();
    try {
        // Створення таблиць та інших ініціалізаційних дій
    } finally {
        connection.release();
    }
};

module.exports = { pool, query, initializeDatabase };
