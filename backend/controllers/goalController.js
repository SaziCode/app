//D:\ospanel\OSPanel\domains\pwa_goal_planner\backend\controllers\goalController.js

const db = require('../models/db');
require("dotenv").config();

const { query } = require("../models/db");
const axios = require("axios");
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








// Додавання нової цілі


// Генерація підзадач через API Gemini
async function generateTasks(req, res) {
    const { title, description, startDate, deadline } = req.body;

    try {
        console.log('Запит на генерацію підзадач:', { title, description, startDate, deadline });

        // Перевірка наявності API ключа
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("API ключ відсутній");
        }

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Створи список підзадач для мети: "${title}". Опис: "${description}". Початок: ${startDate}, дедлайн: ${deadline}.`
                            }
                        ]
                    }
                ]
            },
            {
                headers: { "Content-Type": "application/json" },
                params: { key: process.env.GEMINI_API_KEY }
            }
        );

        console.log('Відповідь від API:', response.data);

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            const tasksText = response.data.candidates[0].content.parts[0].text;
            const tasks = tasksText.split("\n").filter(task => task.trim() !== "");
            res.json({ tasks });
        } else {
            console.error("Помилка: Невірна відповідь від API", response.data);
            res.status(500).json({ error: "Не вдалося згенерувати підзадачі" });
        }
    } catch (error) {
        console.error("Помилка генерації підзадач:", error);
        res.status(500).json({ error: "Не вдалося згенерувати підзадачі" });
    }
}
// Додавання нової цілі
async function addGoal(req, res) {
    try {
        console.log('Збереження задач 4');
        const { title, description, start_date, deadline } = req.body;
        const user_id = Math.floor(Math.random() * 4) + 1;

        console.log("Отримані дані:", { user_id, title, description, start_date, deadline });

        if (!title || !description || !start_date || !deadline) {
            throw new Error("Не всі обов'язкові дані передані");
        }

        const queryText = `
            INSERT INTO goals (user_id, title, description, progress, created_at, start_date, deadline, status) 
            VALUES (?, ?, ?, 0, NOW(), ?, ?, 'active')
        `;

        console.log("Перед виконанням SQL-запиту");
        const dbResult = await db.query(queryText, [user_id, title, description, start_date, deadline]);
        console.log("Результат SQL-запиту:", dbResult);

        if (!dbResult || !dbResult.insertId) {
            throw new Error("Не вдалося отримати ID нової цілі");
        }

        res.status(201).json({ message: "Ціль успішно додана!", goalId: dbResult.insertId });
    } catch (error) {
        console.error("Помилка при додаванні цілі:", error);
        res.status(500).json({ message: "Помилка сервера при додаванні цілі" });
    }
}




// Збереження задач
async function saveTasks(req, res) {
    const { tasks, goalId } = req.body;
    console.log('Збереження задач 3');
    try {
        console.log('Отримані дані для збереження задач:', { tasks, goalId });
        console.log('Збереження задач 7');
        if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
            console.log('Збереження задач 9');
            throw new Error("Невірні дані задач");
        }

        if (!goalId) {
            console.log('Збереження задач 8');
            throw new Error("Невірний ID цілі");
        }

        const values = tasks.map(task => [goalId, task]);

        const placeholders = values.map(() => '(?, ?)').join(', ');
        const flattenedValues = values.flat();

        const queryText = `INSERT INTO tasks (goal_id, description) VALUES ${placeholders}`;

        await db.query(queryText, flattenedValues);

        console.log("Збережено задач:", tasks.length);
        res.status(201).json({ message: "Задачі успішно збережено" });
    } catch (error) {
        console.error("Помилка збереження задач:", error);
        res.status(500).json({ error: "Не вдалося зберегти задачі" });
    }
}


module.exports = { getActiveGoals, getReminders, getActivityGraph, createGoal, addGoal, generateTasks,saveTasks };
