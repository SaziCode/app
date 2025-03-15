const db = require('../models/db');

// Отримання активних цілей
async function getActiveGoals(req, res) {
    try {
        const [goals] = await db.query(`
            SELECT g.id, g.title, g.start_date, g.deadline, g.progress, 
                   JSON_ARRAYAGG(t.tag_name) AS tags
            FROM goals g
            LEFT JOIN goal_tags gt ON g.id = gt.goal_id
            LEFT JOIN tags t ON gt.tag_id = t.id
            WHERE g.status = 'active'
            GROUP BY g.id
        `);
        res.json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}

// Отримання нагадувань
async function getReminders(req, res) {
    try {
        const [reminders] = await db.query(`
            SELECT id, title, last_updated 
            FROM goals 
            WHERE status = 'active' AND DATEDIFF(NOW(), last_updated) > 2
        `);
        res.json(reminders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}

// Отримання графіку активності користувача
async function getActivityGraph(req, res) {
    try {
        const [activity] = await db.query(`
            SELECT MONTH(completion_date) AS month, COUNT(*) AS completed_tasks
            FROM tasks
            WHERE completion_date >= DATE_SUB(NOW(), INTERVAL 8 MONTH)
            GROUP BY MONTH(completion_date)
        `);
        res.json(activity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}

// Створення нової цілі
async function createGoal(req, res) {
    const { title, start_date, deadline, tags } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO goals (title, start_date, deadline, status) VALUES (?, ?, ?, 'active')",
            [title, start_date, deadline]
        );
        const goalId = result.insertId;

        if (tags && tags.length > 0) {
            for (let tag of tags) {
                await db.query("INSERT INTO goal_tags (goal_id, tag_id) VALUES (?, ?)", [goalId, tag]);
            }
        }
        res.status(201).json({ message: "Ціль створено", goalId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка створення цілі" });
    }
}

module.exports = { getActiveGoals, getReminders, getActivityGraph, createGoal };
