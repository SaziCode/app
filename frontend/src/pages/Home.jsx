// src/pages/Home.js
import React from 'react';
import ActiveGoals from '../components/ActiveGoals';
import Users from '../components/Users';
import Activity from '../components/Activity';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


const Home = () => {
	const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login'); // Перенаправлення, якщо немає токена
        }
    }, []);

    return (
        <div>
            <h1>Планування цілей</h1>
            <ActiveGoals />
            <Activity />
            <Users />
        </div>
    );
};

export default Home;
