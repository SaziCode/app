const express = require('express');
const app = express(); 
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const goalsRoutes = require('./routes/goalRoutes');
const path = require('path');
const bodyParser = require('body-parser');
const { verifyToken } = require('./middleware/authMiddleware');
require('dotenv').config();
// Налаштовуємо CORS
app.use(cors({
    origin: '*', // Замінити на правильний домен
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(bodyParser.json());



// Використовуємо маршрути
app.use('/api', goalsRoutes); // Усі маршрути будуть доступні з префіксом /api
app.use('/api/auth', authRoutes);

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Вказуємо директорію для статичних файлів
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Використання маршруту авторизації
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});