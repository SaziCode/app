// backend/models/goalModel.js
const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

// Ініціалізація бази даних
const initDB = async () => {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password
    });
    try {
        // Створення бази даних, якщо її немає
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log("База даних створена або вже існує.");
    } catch (error) {
        console.error("Помилка при створенні бази даних:", error);
    } finally {
        connection.end();
    }
};

// Пул з'єднань для доступу до бази даних
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Створення таблиць, якщо вони не існують
const createTables = async () => {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                progress INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS activity (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                goal_id INT NOT NULL,
                date DATE NOT NULL,
                progress INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
            );
        `);
        console.log("Таблиці створені або вже існують.");
    } catch (error) {
        console.error("Помилка при створенні таблиць:", error);
    } finally {
        conn.release();
    }
};

module.exports = { pool, initDB, createTables };
