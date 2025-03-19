const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

// Реєстрація
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Received data:', req.body);

    try {
        const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('Query result:', result);

        // Перевірка результату запиту
		
        
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
		console.log('Existing user:', existingUser);
		
		if (existingUser && existingUser.length > 0) {
			return res.status(400).json({ message: 'Користувач з такою поштою вже існує' });
		}
		

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        res.status(201).json({ message: 'Реєстрація успішна' });
    } catch (error) {
        console.error('Server error during registration:', error);
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});


// Перевірка статусу користувача (чи увійшов він)
router.get('/status/:email', (req, res) => {
    const { email } = req.params;

    if (loggedInUsers.has(email)) {
        return res.status(200).json({ loggedIn: true, message: 'Користувач уже увійшов' });
    } else {
        return res.status(200).json({ loggedIn: false, message: 'Користувач не увійшов' });
    }
});

// Логін
const loggedInUsers = new Set(); // Збереження залогінених користувачів

// Логін
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login request received:', req.body);

    try {
        // Виконуємо запит до бази
        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        console.log('Database query result:', users); // Додаємо логування

        // Перевіряємо, чи знайдено користувача
        if (!users || users.length === 0) {
            console.log('No user found with this email');
            return res.status(400).json({ message: 'Невірна пошта або пароль' });
        }

        const user = Array.isArray(users) ? users[0] : users; // Виправлення тут!

        console.log('User found:', user);

        if (!user.password) {
            console.log('User password is missing in DB');
            return res.status(500).json({ message: 'Помилка сервера: відсутній пароль' });
        }

        // Перевірка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Incorrect password');
            return res.status(400).json({ message: 'Невірна пошта або пароль' });
        }

        // Генерація JWT
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
		console.log('JWT_SECRET:', process.env.JWT_SECRET);
        console.log('Login successful, token generated');

        res.status(200).json({ message: 'Вхід успішний', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});




module.exports = router;
