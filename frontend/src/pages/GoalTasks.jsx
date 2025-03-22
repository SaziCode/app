import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/GoalTasks.css";

const GoalTasks = () => {
  const { goalId } = useParams(); // Отримуємо ID цілі з URL
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [userId, setUserId] = useState(null);
  const [hoursSpent, setHoursSpent] = useState({}); // Стан для збереження годин для кожного завдання

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!goalId) {
      console.error("goalId не передано в URL");
      return;
    }

    // Отримання завдань для цілі
    axios
      .get(`http://localhost:3000/api/goals/${goalId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setTasks(response.data.tasks);
        setGoalTitle(response.data.goalTitle);
        setUserId(response.data.userId);
      })
      .catch((error) => {
        console.error("Помилка при отриманні завдань:", error);
      });
  }, [goalId, navigate]);

  const handleTaskCompletion = (taskId) => {
    const token = localStorage.getItem("token");
    const completionDate = new Date().toISOString().split("T")[0]; // Поточна дата у форматі YYYY-MM-DD
    const hours = hoursSpent[taskId] || 0; // Отримуємо введені години для завдання

    axios
      .post(
        `http://localhost:3000/api/tasks/${taskId}/complete`,
        { completionDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        // Оновлюємо прогрес у таблиці activity
        const progressIncrement = 100 / tasks.length;

        axios
          .post(
            `http://localhost:3000/api/activity`,
            {
              userId,
              goalId,
              date: completionDate, // Використовуємо форматовану дату
              progress: progressIncrement,
              hours, // Передаємо введені години
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then(() => {
            // Оновлюємо список завдань
            setTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.id === taskId ? { ...task, completed: true } : task
              )
            );

            // Оновлюємо прогрес цілі
            axios
              .post(
                `http://localhost:3000/api/goals/${goalId}/update-progress`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((response) => {
                console.log("Прогрес цілі оновлено:", response.data.totalProgress);
              })
              .catch((error) => {
                console.error("Помилка при оновленні прогресу цілі:", error);
              });
          })
          .catch((error) => {
            console.error("Помилка при оновленні прогресу:", error);
          });
      })
      .catch((error) => {
        console.error("Помилка при завершенні завдання:", error);
      });
  };

  const handleHoursChange = (taskId, value) => {
    setHoursSpent((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  return (
    <div className="container">
      <h1 className="header">Завдання для цілі: {goalTitle}</h1>
      <div className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <p>{task.description}</p>
              <input
                type="number"
                min="0"
                placeholder="Годин"
                value={hoursSpent[task.id] || ""}
                onChange={(e) => handleHoursChange(task.id, e.target.value)}
                disabled={task.completed}
              />
              <button
                className={`complete-button ${task.completed ? "completed" : ""}`}
                onClick={() => handleTaskCompletion(task.id)}
                disabled={task.completed}
              >
                {task.completed ? "Виконано" : "✔"}
              </button>
            </div>
          ))
        ) : (
          <p>Завдання відсутні</p>
        )}
      </div>
      <button className="button" onClick={() => navigate("/")}>
        Повернутися до списку цілей
      </button>
    </div>
  );
};

export default GoalTasks;