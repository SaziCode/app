//D:\ospanel\OSPanel\domains\pwa_goal_planner\backend\controllers\goalController.js

const db = require('../models/db');
require("dotenv").config();

const { query } = require("../models/db");
const axios = require("axios");

// Отримання активних цілей
async function getActiveGoals(req, res) {
    try {
        console.log('Отримання активних цілей для користувача:', req.user.id);

        const goals = await db.query(`
            SELECT g.id, g.title, g.start_date, g.deadline, g.description, g.status,g.progress,
                   JSON_ARRAYAGG(t.tag_name) AS tags
            FROM goals g
            LEFT JOIN goal_tags gt ON g.id = gt.goal_id
            LEFT JOIN tags t ON gt.tag_id = t.id
            WHERE g.status = 'active' AND g.user_id = ?
            GROUP BY g.id
        `, [req.user.id]);

        console.log('Результат SQL-запиту:', goals);

        if (!goals || goals.length === 0) {
            return res.status(404).json({ message: 'Активні цілі не знайдено' });
        }

        res.json(goals);
    } catch (error) {
        console.error("Помилка отримання активних цілей:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}

async function getTotalTimeForGoal(req, res) {
    try {
        const { goalId } = req.params;

        const [result] = await db.query(`
            SELECT COALESCE(SUM(hours), 0) AS total_hours
            FROM activity
            WHERE goal_id = ?
        `, [goalId]);

        if (!result) {
            return res.status(404).json({ message: 'Дані не знайдено' });
        }

        res.json({ total_hours: Number(result.total_hours) }); // Перетворюємо на число
    } catch (error) {
        console.error("Помилка отримання загального часу для мети:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}





// Отримання нагадувань
async function getReminders(req, res) {
    try {
        const reminders = await db.query(`
            SELECT id, title, last_updated 
            FROM goals 
            WHERE status = 'active' AND DATEDIFF(NOW(), last_updated) > 2 AND user_id = ?
        `, [req.user.id]); // Використовуємо req.user.id для фільтрації
        res.json(reminders);
    } catch (error) {
        console.error("Помилка отримання нагадувань:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}

// Отримання графіку активності користувача
async function getActivityData(req, res) {
    try {
        const activityData = await db.query(`
            SELECT 
			
                MONTH(a.date) AS month, 
                YEAR(a.date) AS year,
				SUM(a.hours) AS total_hours,
                SUM(a.progress) AS total_progress,
                SUM(a.progress) - LAG(SUM(a.progress)) OVER (ORDER BY YEAR(a.date), MONTH(a.date)) AS progress_difference
            FROM activity a
            WHERE a.user_id = ? AND a.date >= DATE_SUB(NOW(), INTERVAL 8 MONTH)
            GROUP BY YEAR(a.date), MONTH(a.date)
            ORDER BY YEAR(a.date), MONTH(a.date)
        `, [req.user.id]);

        // Перевірка, чи є дані масивом
        if (!activityData || !Array.isArray(activityData)) {
            return res.status(404).json({ message: 'Дані активності не знайдено' });
        }
	

        // Форматуємо дані для зручності
        const formattedData = activityData.map((item) => ({
            month: item.month,
            year: item.year,
			total_hours: item.total_hours,
            total_progress: item.total_progress,
            progress_difference: item.progress_difference || 0, // Якщо немає попереднього місяця, різниця = 0
        }));

        res.json(formattedData, );
    } catch (error) {
        console.error('Помилка отримання даних активності:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
}
  
async function getTotalProgressForGoal(req, res) {
    try {
        const { goalId } = req.params;

        const [result] = await db.query(`
            SELECT COALESCE(SUM(progress), 0) AS total_progress
            FROM activity
            WHERE goal_id = ?
        `, [goalId]);

        if (!result) {
            return res.status(404).json({ message: 'Дані не знайдено' });
        }

        res.json({ total_progress: Number(result.total_progress) }); // Перетворюємо на число
    } catch (error) {
        console.error("Помилка отримання загального прогресу для мети:", error);
        res.status(500).json({ message: "Помилка сервера" });
    }
}


async function getActivityGraph(req, res) {
    try {
        const graphData = await db.query(`
            SELECT 
                MONTH(a.date) AS month, 
                YEAR(a.date) AS year,
                SUM(a.hours) AS total_hours,
                AVG(a.progress) AS average_progress
            FROM activity a
            WHERE a.user_id = ? AND a.date >= DATE_SUB(NOW(), INTERVAL 8 MONTH)
            GROUP BY YEAR(a.date), MONTH(a.date)
            ORDER BY YEAR(a.date), MONTH(a.date)
        `, [req.user.id]);

        res.json(graphData);
    } catch (error) {
        console.error('Помилка отримання графіку активності:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
}




async function createGoal(req, res) {
    const { title, start_date, deadline, tags } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO goals (user_id, title, start_date, deadline, status) VALUES (?, ?, ?, ?, 'active')",
            [req.user.id, title, start_date, deadline] // Використовуємо req.user.id для фільтрації
        );
        const goalId = result.insertId;

        if (tags && tags.length > 0) {
            for (let tag of tags) {
                await db.query("INSERT INTO goal_tags (goal_id, tag_id) VALUES (?, ?)", [goalId, tag]);
            }
        }
        res.status(201).json({ message: "Ціль створено", goalId });
    } catch (error) {
        console.error("Помилка створення цілі:", error);
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
                                text: `Створи список підзадач для мети: "${title}". Опис: "${description}". Початок: ${startDate}, дедлайн: ${deadline}. Пиши тільки підзадачі без коментарів.`
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

async function getUserData(req, res) {
    try {
        const userId = req.user.id; // Отримуємо ID користувача з токена
        const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]); // Запит до бази даних
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        res.json(user); // Повертаємо дані користувача
    } catch (error) {
        console.error('Помилка при отриманні даних користувача:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
}


module.exports = {
    getActiveGoals,
    getReminders,
    getActivityGraph,
    createGoal,
    addGoal,
    generateTasks,
    saveTasks,
    getUserData,
	getTotalTimeForGoal, // Переконайтеся, що ця функція є тут
	getTotalProgressForGoal,
    getActivityData
};