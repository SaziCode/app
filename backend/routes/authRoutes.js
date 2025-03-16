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
// Логін
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login request received:', req.body); // Логування отриманих даних

    try {
        // Виконуємо запит до бази даних для отримання користувача за email
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        // Перевірка, чи знайдений користувач
        if (!user) {
            console.log('No user found with this email');  // Логування, якщо користувача не знайдено
            return res.status(400).json({ message: 'Невірна пошта або пароль' });
        }

        console.log('User found:', user); // Логування знайденого користувача

        // Перевірка, чи існує пароль у знайденого користувача
        if (!user.password) {
            console.log('Password field is missing for user'); // Логування, якщо немає пароля
            return res.status(400).json({ message: 'Невірна пошта або пароль' });
        }

        // Перевірка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Incorrect password'); // Логування, якщо пароль невірний
            return res.status(400).json({ message: 'Невірна пошта або пароль' });
        }

        // Генерація токену
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        console.log('Login successful, token generated'); // Логування успішного входу

        // Відправлення відповіді з токеном
        res.status(200).json({ message: 'Вхід успішний', token });
    } catch (error) {
        console.error('Login error:', error); // Логування помилок
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});




module.exports = router;
