//D:\ospanel\OSPanel\domains\pwa_goal_planner\backend\routes\goalRoutes.js

const express = require('express');
const router = express.Router();
const { query } = require('../models/db'); // Імпортуємо query з модуля db

const { verifyToken } = require('../middleware/authMiddleware');
const {
    getActiveGoals,
    getReminders,
    getActivityGraph,
	getTotalTimeForGoal,
    createGoal,
    addGoal,
    generateTasks,
    saveTasks,
    getUserData,
	getTotalProgressForGoal,
    switchToNextGoal,
    getLastUpdateForGoal,
    getActivityData,
    getAllGoals
} = require('../controllers/goalController');

// Приклад даних сповіщень

  
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Логика для подсчета количества уведомлений
        const [notifications] = await query(
            `SELECT COUNT(*) AS count
             FROM notifications
             WHERE user_id = ? AND is_read = 0`,
            [userId]
        );

        res.json({ count: notifications.count });
    } catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

router.get('/goals/last-update', verifyToken, getLastUpdateForGoal);
router.post('/goals/switch', verifyToken, switchToNextGoal);
router.get('/goals/:goalId/total-time', verifyToken, getTotalTimeForGoal);
router.get('/goals/:goalId/total-progress', verifyToken, getTotalProgressForGoal);
// Захищені маршрути
router.get('/active-goals', verifyToken, getActiveGoals);
router.get('/reminders', verifyToken, getReminders);
router.get('/goals', verifyToken, getAllGoals);
router.post('/create-goal', verifyToken, createGoal);
router.post('/save-tasks', verifyToken, saveTasks);
router.get('/user', verifyToken, getUserData);
// Додавання цілі
router.post("/goals", addGoal);
router.get('/goals', verifyToken, getActiveGoals);
// Генерація підзадач
router.post("/generate-tasks", generateTasks);
// Збереження задач
router.post("/tasks", saveTasks); // Додайте цей маршрут

// Додаємо маршрут для отримання даних активності
router.get('/activity-data', verifyToken, getActivityData);





  

module.exports = router;
