// src/pages/Home.js
import React from 'react';
import ActiveGoals from '../components/ActiveGoals';
import Users from '../components/Users';
import Activity from '../components/Activity';

const Home = () => {
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
