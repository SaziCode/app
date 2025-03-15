const express = require("express");
const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken");
const db = require("../models/db"); // Підключення до бази
const router = express.Router();

const SECRET_KEY = "your_secret_key"; // Ключ для JWT

// Реєстрація користувача
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Усі поля обов'язкові!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
        res.json({ message: "Користувача створено!" });
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера!" });
    }
});

// Авторизація користувача
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Усі поля обов'язкові!" });
    }

    try {
        const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            return res.status(401).json({ message: "Користувача не знайдено!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Невірний пароль!" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: "Успішний вхід!", token });
    } catch (error) {
        res.status(500).json({ message: "Помилка сервера!" });
    }
});

// GET /auth/profile — Отримання профілю користувача
router.get("/profile", async (req, res) => {
    // Отримуємо токен із заголовка
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Вам потрібно увійти!" });
    }

    try {
        // Перевіряємо токен
        const decoded = jwt.verify(token, SECRET_KEY);

        // Отримуємо дані користувача за ID
        const [user] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [decoded.id]);

        if (!user) {
            return res.status(404).json({ message: "Користувача не знайдено!" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Помилка перевірки токена!" });
    }
});

// GET /auth/logout — Вихід з системи
router.get("/logout", (req, res) => {
    // Видаляємо сесію
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Помилка при виході!" });
        }

        res.json({ message: "Вихід успішний!" });
    });
});

module.exports = router;
