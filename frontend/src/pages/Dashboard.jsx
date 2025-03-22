import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/Dashboard.css'; // Імпортуємо CSS-файл

const Dashboard = () => {
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [goal, setGoal] = useState({});
  const [lastUpdate, setLastUpdate] = useState('тиждень тому');
  const [totalTime, setTotalTime] = useState(0); // Початковий стан для збереження загального часу

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не знайдено. Авторизуйтесь.');
      return;
    }

    // Отримання даних цілі
    axios
      .get('http://localhost:3000/api/goals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const activeGoal = response.data.find((g) => g.status === 'active');
          setGoal(activeGoal || response.data[0]); // Встановлюємо активну ціль або першу
        } else {
          console.error('Цілі не знайдено');
        }
      })
      .catch((error) => {
        console.error('Помилка при отриманні даних цілі:', error);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!goal.id || !token) return;

    // Отримання останньої дати оновлення
    axios
      .get('http://localhost:3000/api/goals/last-update', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { goalId: goal.id },
      })
      .then((response) => {
        const lastUpdateDate = response.data.lastUpdate
          ? new Date(response.data.lastUpdate)
          : null;

        if (lastUpdateDate && !isNaN(lastUpdateDate)) {
          setLastUpdate(lastUpdateDate.toLocaleDateString());
        } else {
          setLastUpdate('Невідома дата'); // Значення за замовчуванням
        }
      })
      .catch((error) => {
        console.error('Помилка при отриманні останньої дати оновлення:', error);
        setLastUpdate('Невідома дата'); // Значення за замовчуванням у разі помилки
      });

    // Отримання загального часу для мети
    axios
      .get(`http://localhost:3000/api/goals/${goal.id}/total-time`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const totalTime = response.data.totalTime;

        if (typeof totalTime === 'number' && !isNaN(totalTime)) {
          setTotalTime(totalTime);
        } else {
          setTotalTime(0); // Значення за замовчуванням
        }
      })
      .catch((error) => {
        console.error('Помилка при отриманні загального часу для мети:', error);
        setTotalTime(0); // Значення за замовчуванням у разі помилки
      });

    // Отримання даних активності
    axios
      .get('http://localhost:3000/api/activity-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { goalId: goal.id },
      })
      .then((response) => {
        const formattedData = response.data.map((data, index, array) => {
          if (index === 0) {
            return { ...data, progress_difference: data.total_progress };
          } else {
            const previous = array[index - 1];
            return {
              ...data,
              progress_difference: data.total_progress - previous.total_progress,
            };
          }
        });
        setActivityData(formattedData);
      })
      .catch((error) => {
        console.error('Помилка при отриманні даних активності:', error);
      });
  }, [goal.id]);

  const handleSwitchGoal = () => {
    const token = localStorage.getItem('token');
    if (!goal.id || !token) return;

    axios
      .post(
        'http://localhost:3000/api/goals/switch',
        { currentGoalId: goal.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log('Ціль оновлено:', response.data);

        // Оновлюємо поточну ціль
        axios
          .get('http://localhost:3000/api/goals', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            if (Array.isArray(response.data) && response.data.length > 0) {
              const activeGoal = response.data.find((g) => g.status === 'active');
              setGoal(activeGoal || {});
            } else {
              console.error('Цілі не знайдено');
            }
          })
          .catch((error) => {
            console.error('Помилка при отриманні даних цілі:', error);
          });
      })
      .catch((error) => {
        console.error('Помилка при перемиканні цілі:', error);
      });
  };

  const handleMonthClick = (month) => {
    const currentMonthData = activityData.find((data) => data.month === month);
    const previousMonthData = activityData.find((data) => data.month === month - 1);

    if (currentMonthData && previousMonthData) {
      setComparisonData({
        current: currentMonthData,
        previous: previousMonthData,
        difference: currentMonthData.total_progress - previousMonthData.total_progress,
      });
    } else {
      setComparisonData(null);
    }
    setSelectedMonth(month);
  };

  const handleUpdateReminderClick = () => {
    if (goal.id) {
      navigate(`/goal/${goal.id}`);
    }
  };

  return (
    <div className="container">
      <p className="date">Сьогодні: {new Date().toLocaleDateString()}</p>

      <div className="goal-container">
        <div className="goal-details">
          <div className="goal-card">
            <div className="goal-icon">📖</div>
            <div>
              <p className="goal-text">Ціль: {goal.title}</p>
              <p className="goal-tags">Теги: {goal.tags}</p>
            </div>
          </div>
          <div className="progress-container">
            <div className="goal-card">
              <span className="progress-label">Прогрес</span>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="progress-details">
              <span className="goal-card">⏳ Витрачено часу: {totalTime.toLocaleString()}ч</span>
              <span className="goal-card">
                📅 Активний місяць: {new Date().toLocaleString('default', { month: 'short' })}
              </span>
            </div>
            <button className="button" onClick={handleSwitchGoal}>
              Перейти до наступної цілі
            </button>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="sub-header">Активність за 8 місяців</h3>
        <div className="chart">
          {activityData.map((data) => (
            <div key={data.month} className="bar-wrapper">
              <div
                className="bar"
                onClick={() => handleMonthClick(data.month)}
                style={{
                  height: `${Math.min(data.progress_difference || data.total_progress, 100) * 3}px`,
                }}
              >
                {selectedMonth === data.month && (
                  <span className="bar-label">
                    {data.progress_difference !== null ? `${data.progress_difference}%` : '0%'}
                  </span>
                )}
              </div>
              <span className="month-label">
                {new Date(data.year, data.month - 1).toLocaleString('default', { month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="goal-card" onClick={handleUpdateReminderClick} style={{ cursor: 'pointer' }}>
        <div className="update-reminder">
          <p>Не забудьте оновити дані своїх цілей!</p>
          <p className="last-update">Останнє оновлення: {lastUpdate}</p>
        </div>
      </div>

      <footer className="footer">
        <button className="footer-button" onClick={() => navigate('/dashboard')}>
          🎯
        </button>
        <button className="footer-add-button" onClick={() => navigate('/addgoal')}>
          ➕
        </button>
        <button className="footer-button" onClick={() => navigate('/')}>💬</button>
      </footer>
    </div>
  );
};

export default Dashboard;