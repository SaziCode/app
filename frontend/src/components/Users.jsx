import React, { useState, useEffect } from 'react';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Запит на сервер для отримання всіх користувачів
        fetch('http://localhost:3000/api/users') // API для отримання користувачів
            .then(response => response.json()) // Парсимо відповідь у форматі JSON
            .then(data => {
                console.log("Users data:", data); // Вивести отримані дані
                setUsers(data); // Оновлення стану користувачів
            })
            .catch(error => console.error('Error fetching users:', error)); // Логування помилок
    }, []); // Порожній масив забезпечує виконання useEffect лише один раз після завантаження компонента

    return (
        <div>
            <h2>Користувачі</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        <p>ID: {user.id}</p>
                        <p>Ім'я: {user.name}</p>
                        <p>Email: {user.email}</p>
                        <p>Пароль: {user.password}</p> {/* Виведення пароля, але це небезпечно */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Users;
