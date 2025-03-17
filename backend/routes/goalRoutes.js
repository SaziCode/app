//D:\ospanel\OSPanel\domains\pwa_goal_planner\backend\routes\goalRoutes.js

const express = require('express');
const router = express.Router();
const { query } = require('../models/db'); // Імпортуємо query з модуля db


const { generateTasks, saveTasks, addGoal } = require("../controllers/goalController");


// Додавання цілі
router.post("/goals", addGoal);

// Генерація підзадач
router.post("/generate-tasks", generateTasks);
// Збереження задач
router.post("/tasks", saveTasks); // Додайте цей маршрут





// Отримання активних цілей
router.get('/goals', async (req, res) => {
	try {
	  const goals = await query(`
		SELECT g.id, g.title, g.description, g.progress, g.created_at, g.start_date, g.deadline, g.status
		FROM goals g
		WHERE g.status = 'active'
	  `);
	  
	  // Форматування дати перед відправкою
	  goals.forEach(goal => {
		goal.created_at = goal.created_at ? goal.created_at.toISOString().split('T')[0] : null;
		goal.start_date = goal.start_date ? goal.start_date.toISOString().split('T')[0] : null;
		goal.deadline = goal.deadline ? goal.deadline.toISOString().split('T')[0] : null;
	  });
  
	  res.json(goals);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: "Помилка сервера" });
	}
  });
// Отримати нагадування про оновлення цілей
router.get('/reminders', async (req, res) => {
    try {
        const reminders = await query(`
            SELECT id, title, last_updated 
            FROM goals 
            WHERE status = 'active' AND DATEDIFF(NOW(), last_updated) > 2
        `);
        res.json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Отримати графік активності користувача
router.get('/activity', async (req, res) => {
    try {
        const activity = await query(`
            SELECT 
                MONTH(a.date) AS month, 
                u.name AS user_name, 
                g.title AS goal_title,
                AVG(a.progress) AS average_progress
            FROM activity a
            JOIN users u ON a.user_id = u.id
            JOIN goals g ON a.goal_id = g.id
            WHERE a.date >= DATE_SUB(NOW(), INTERVAL 8 MONTH)
            GROUP BY MONTH(a.date), u.id, g.id
            ORDER BY MONTH(a.date), u.name, g.title;
        `);
        res.json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});


// Отримання всіх користувачів
router.get('/users', async (req, res) => {
    try {
        // Запит до бази даних для отримання всіх користувачів
        const users = await query('SELECT id, name, email, password FROM users');
        
        // Повертаємо список користувачів
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при отриманні користувачів' });
    }
});

// Створити нову ціль

  

module.exports = router;
