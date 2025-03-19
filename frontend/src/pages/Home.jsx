import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveGoals from '../components/ActiveGoals';
import Users from '../components/Users';
import Activity from '../components/Activity';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login'); // Перенаправлення, якщо немає токена
    } else {
      // Отримання даних користувача з сервера
      axios.get('http://localhost:3000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Помилка при отриманні даних користувача:', error);
        navigate('/login'); // Перенаправлення у випадку помилки
      });
    }
  }, [navigate]);

  if (!userData) {
    return <div>Завантаження...</div>;
  }

  return (
    <div>
      <p>Додати мету? <a href="/addgoal">Так</a></p>
	  <p>Дешборд <a href="/dashboard">Так</a></p>
      <h1>Планування цілей</h1>
      <ActiveGoals userId={userData.id} />

      <Users userId={userData.id} />
    </div>
  );
};

export default Home;	// Додати експорт за замовчуванням для використання в інших частинах додатка