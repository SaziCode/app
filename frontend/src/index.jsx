import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';  // Використовуємо новий метод в React 18
import App from './App';

// Основна компонента для завантаження даних
const Main = () => {
  const [goals, setGoals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Завантаження даних
    Promise.all([
      fetch('/api/goals').then(res => res.json()),    // Завантаження цілей
      fetch('/api/activity').then(res => res.json()), // Завантаження активностей
      fetch('/api/reminders').then(res => res.json()) // Завантаження нагадувань
    ])
      .then(([goalsData, activityData, remindersData]) => {
        if (Array.isArray(goalsData)) setGoals(goalsData);
        if (Array.isArray(activityData)) setActivity(activityData);
        if (Array.isArray(remindersData)) setReminders(remindersData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Активні цілі</h1>
      <ul>
        {goals.map(goal => (
          <li key={goal.id}>
            <h2>{goal.name}</h2>
            <p>{goal.description}</p>
          </li>
        ))}
      </ul>

      <h1>Графік активності</h1>
      <ul>
        {activity.map(act => (
          <li key={act.id}>
            <h2>{act.name}</h2>
            <p>{act.date}</p>
          </li>
        ))}
      </ul>

      <h1>Нагадування</h1>
      <ul>
        {reminders.map(reminder => (
          <li key={reminder.id}>
            <p>{reminder.message}</p>
            <p>{reminder.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Рендер основного компонента
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
  <App />  {/* Замінити <App /> на <Main /> якщо ви хочете рендерити Main */}
</React.StrictMode>,
)
