const db = require('../models/db');
require("dotenv").config();

const { query } = require("../models/db");
const axios = require("axios");

// Отримання завдань для конкретної цілі
async function getTasksForGoal(req, res) {
  try {
    const { goalId } = req.params;

    if (!goalId) {
      console.error("goalId не передано");
      return res.status(400).json({ message: "goalId is required" });
    }

    console.log(`Отримання завдань для goalId: ${goalId}`);
    const tasks = await db.query(
      `
      SELECT id, description, completion_date AS completed
      FROM tasks
      WHERE goal_id = ?
      `,
      [goalId]
    );

    console.log(`Знайдено завдань: ${tasks.length}`);
    const [goal] = await db.query(
      `
      SELECT title, user_id
      FROM goals
      WHERE id = ?
      `,
      [goalId]
    );

    if (!goal) {
      console.error(`Ціль із goalId ${goalId} не знайдено`);
      return res.status(404).json({ message: "Ціль не знайдено" });
    }

    res.json({
      tasks: tasks.map((task) => ({
        ...task,
        completed: !!task.completed,
      })),
      goalTitle: goal.title,
      userId: goal.user_id,
    });
  } catch (error) {
    console.error("Помилка отримання завдань для цілі:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
}

// Завершення завдання
async function completeTask(req, res) {
  try {
    const { taskId } = req.params;
    const { completionDate } = req.body;

    await db.query(
      `
      UPDATE tasks
      SET completion_date = ?
      WHERE id = ?
      `,
      [completionDate, taskId]
    );

    res.json({ message: "Завдання завершено" });
  } catch (error) {
    console.error("Помилка завершення завдання:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
}

// Додавання активності
async function addActivity(req, res) {
  try {
    const { userId, goalId, date, progress, hours } = req.body;

    // Перетворення дати у формат YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log("Форматована дата:", formattedDate);

    await db.query(
      `
      INSERT INTO activity (user_id, goal_id, date, progress, hours)
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, goalId, formattedDate, progress, hours]
    );

    res.json({ message: "Прогрес оновлено" });
  } catch (error) {
    console.error("Помилка оновлення прогресу:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
}


// Оновлення прогресу в таблиці goals
async function updateGoalProgress(req, res) {
	try {
	  console.log("Виклик функції updateGoalProgress для goalId:", req.params.goalId);
  
	  const { goalId } = req.params;
  
	  if (!goalId) {
		console.error("goalId не передано");
		return res.status(400).json({ message: "goalId є обов'язковим" });
	  }
  
	  const [result] = await db.query(
		`
		SELECT SUM(progress) AS totalProgress
		FROM activity
		WHERE goal_id = ?
		`,
		[goalId]
	  );
  
	  const totalProgress = result.totalProgress || 0;
  
	  await db.query(
		`
		UPDATE goals
		SET progress = ?
		WHERE id = ?
		`,
		[totalProgress, goalId]
	  );
  
	  console.log("Прогрес цілі оновлено:", totalProgress);
	  res.json({ message: "Прогрес цілі оновлено", totalProgress });
	} catch (error) {
	  console.error("Помилка оновлення прогресу цілі:", error);
	  res.status(500).json({ message: "Помилка сервера" });
	}
  }

module.exports = {
  addActivity,
  updateGoalProgress,
  completeTask,
  getTasksForGoal,
};