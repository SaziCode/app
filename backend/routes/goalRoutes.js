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
    getActivityData
} = require('../controllers/goalController');


router.get('/goals/:goalId/total-time', verifyToken, getTotalTimeForGoal);
router.get('/goals/:goalId/total-progress', verifyToken, getTotalProgressForGoal);
// Захищені маршрути
router.get('/active-goals', verifyToken, getActiveGoals);
router.get('/reminders', verifyToken, getReminders);

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
