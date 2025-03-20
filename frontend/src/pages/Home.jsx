import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../components/Home.css"; // Імпортуємо CSS для стилів

const Home = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // Перенаправлення, якщо немає токена
    } else {
      // Отримання списку цілей
      axios
        .get("http://localhost:3000/api/goals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(async (response) => {
          const goalsWithDetails = await Promise.all(
            response.data.map(async (goal) => {
              try {
                // Отримання totalTime для кожної цілі
                const totalTimeResponse = await axios.get(
                  `http://localhost:3000/api/goals/${goal.id}/total-time`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                // Отримання lastUpdate для кожної цілі
                const lastUpdateResponse = await axios.get(
                  `http://localhost:3000/api/goals/last-update`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    params: { goalId: goal.id },
                  }
                );

                return {
                  ...goal,
                  totalTime: totalTimeResponse.data.totalTime,
                  lastUpdate: lastUpdateResponse.data.lastUpdate,
                };
              } catch (error) {
                console.error("Помилка при отриманні даних для цілі:", error);
                return { ...goal, totalTime: null, lastUpdate: null };
              }
            })
          );

          setGoals(goalsWithDetails);
        })
        .catch((error) => {
          console.error("Помилка при отриманні списку цілей:", error);
          navigate("/login");
        });

      // Отримання кількості сповіщень
      axios
        .get("http://localhost:3000/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setNotifications(response.data.count);
        })
        .catch((error) => {
          console.error("Помилка при отриманні сповіщень:", error);
        });
    }
  }, [navigate]);

  return (
    <div className="goals-container">
      <header className="header">
        <h1>Список цілей</h1>
        <p>Сьогодні: {new Date().toLocaleDateString()}</p>
        {notifications > 0 && <div className="notification-icon">🔔 {notifications}</div>}
      </header>

      <div className="goals-list">
        {goals.map((goal) => (
          <div key={goal.id} className="goal-row">
            <div className="goal-card">
              <h3>{goal.title}</h3>
              <p className="goal-tags">
                {(goal.tags || []).map((tag) => `#${tag}`).join(", ")}
              </p>
            </div>

            <div className="goal-card goal-info-card">
              <p>Відсоток виконання: {goal.progress}%</p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              <p>Витрачено часу: {goal.totalTime ? `${goal.totalTime.toLocaleString()} h` : "N/A"}</p>
              <p>Активний місяць: {goal.lastUpdate ? new Date(goal.lastUpdate).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        ))}
      </div>

      <footer className="footer">
        <button className="footer-button">🎯</button>
        <button
          className="footer-add-button"
          onClick={() => navigate('/addgoal')}
        >
          ➕
        </button>
        <button className="footer-button">💬</button>
      </footer>
    </div>
  );
};

export default Home;