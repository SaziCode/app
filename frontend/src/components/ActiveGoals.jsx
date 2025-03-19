import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ActiveGoals = ({ userId }) => {
  const [goals, setGoals] = useState([]); // Стан для збереження списку цілей
  const [error, setError] = useState(null); // Стан для збереження помилок

  useEffect(() => {
    // Виконуємо запит до API для отримання активних цілей
    axios
      .get(`http://localhost:3000/api/active-goals`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Передаємо токен авторизації
        },
      })
      .then((response) => {
        console.log('Server response:', response.data); // Логування відповіді сервера

        // Перевіряємо, чи є дані масивом
        if (Array.isArray(response.data)) {
          setGoals(response.data); // Зберігаємо цілі у стан
        } else {
          console.error('Дані не є масивом:', response.data);
          setGoals([]); // Скидаємо стан до порожнього масиву
        }
      })
      .catch((error) => {
        console.error('Помилка при отриманні цілей:', error);
        setError('Не вдалося завантажити активні цілі'); // Зберігаємо повідомлення про помилку
        setGoals([]); // Скидаємо стан до порожнього масиву у разі помилки
      });
  }, [userId]); // Виконуємо запит при зміні userId

  return (
    <div>
      <h2>Активні цілі</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Відображення помилки, якщо вона є */}
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>{goal.title}</li> // Відображення кожної цілі
        ))}
      </ul>
    </div>
  );
};

export default ActiveGoals;