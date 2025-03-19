const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Токен не надано' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Додаємо `user` до `req`
        next();
    } catch (error) {
        console.error('Помилка перевірки токена:', error);
        res.status(403).json({ message: 'Недійсний токен' });
    }
}

module.exports = { verifyToken };