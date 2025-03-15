import React, { useState, useEffect } from 'react';

const ActiveGoals = () => {
  const [goals, setGoals] = useState([]);

  // Отримання даних при завантаженні компонента
  useEffect(() => {
    fetch('http://localhost:3000/api/goals') // Запит до API для отримання всіх цілей
      .then(response => response.json())
      .then(data => setGoals(data)) // Збереження даних у стейт
      .catch(error => console.error('Error fetching goals:', error));
  }, []);

  // Форматування дати
  const formatDate = (date) => {
    if (!date) return 'Не вказано'; // Якщо дата відсутня
    return new Date(date).toLocaleDateString('uk-UA'); // Форматуємо дату
  };

  return (
    <div>
      <h2>Активні цілі</h2>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>
            <h3>{goal.title}</h3>
            <p>Опис: {goal.description || 'Не вказано'}</p>
            <p>Прогрес: {goal.progress}%</p>
            <p>Дата створення: {formatDate(goal.created_at)}</p>
            <p>Дата початку: {formatDate(goal.start_date)}</p>
            <p>Термін: {formatDate(goal.deadline)}</p>
            <p>Статус: {goal.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveGoals;
