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

const { getTasksForGoal, completeTask, addActivity, updateGoalProgress} = require('../controllers/taskController');


// Маршрут для отримання сповіщень
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Логіка для отримання цілей, які не оновлювалися більше ніж 7 днів
        const reminders = await query(
            `SELECT g.id AS goalId, g.title AS goalTitle, MAX(a.date) AS lastUpdate
             FROM goals g
             LEFT JOIN activity a ON g.id = a.goal_id
             WHERE g.user_id = ?
             GROUP BY g.id, g.title
             HAVING lastUpdate IS NULL OR lastUpdate < DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
            [userId]
        );

        res.json({
            count: reminders.length,
            reminders: reminders.map((reminder) => ({
                goalId: reminder.goalId,
                goalTitle: reminder.goalTitle,
                lastUpdate: reminder.lastUpdate || "Ніколи",
            })),
        });
    } catch (error) {
        console.error("Помилка при отриманні сповіщень:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

// Маршрут для отримання завдань для конкретної цілі
router.get('/goals/:goalId/tasks', verifyToken, getTasksForGoal);

// Маршрут для завершення завдання
router.post('/tasks/:taskId/complete', verifyToken, completeTask);

// Маршрут для додавання активності
router.post('/activity', verifyToken, addActivity);

// Маршрут для отримання останньої дати оновлення цілі
router.get('/goals/last-update', verifyToken, getLastUpdateForGoal);

// Маршрут для перемикання на наступну ціль
router.post('/goals/switch', verifyToken, switchToNextGoal);

// Маршрут для отримання загального часу для цілі
router.get('/goals/:goalId/total-time', verifyToken, getTotalTimeForGoal);

// Маршрут для отримання загального прогресу для цілі
router.get('/goals/:goalId/total-progress', verifyToken, getTotalProgressForGoal);

// Захищені маршрути
router.get('/active-goals', verifyToken, getActiveGoals);
router.get('/reminders', verifyToken, getReminders);
router.get('/goals', verifyToken, getAllGoals);
router.post('/create-goal', verifyToken, createGoal);
router.post('/save-tasks', verifyToken, saveTasks);
router.get('/user', verifyToken, getUserData);
// Маршрут для оновлення прогресу цілі

router.post('/goals/:goalId/update-progress', verifyToken, updateGoalProgress);


// Додавання нової цілі
router.post("/goals", addGoal);

// Генерація підзадач
router.post("/generate-tasks", generateTasks);

// Збереження задач
router.post("/tasks", saveTasks);

// Додаємо маршрут для отримання даних активності
router.get('/activity-data', verifyToken, getActivityData);

module.exports = router;