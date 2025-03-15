import React, { useState, useEffect } from 'react';

const Activity = () => {
    const [activity, setActivity] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/activity') // API для отримання активності
            .then(response => response.json())
            .then(data => setActivity(data))
            .catch(error => console.error('Error fetching activity:', error));
    }, []);

    return (
        <div>
            <h2>Активність</h2>
            <ul>
                {activity.length > 0 ? (
                    activity.map((item, index) => (
                        <li key={index}>
                            Місяць: {item.month}, Користувач: {item.user_name}, Ціль: {item.goal_title}, 
                            Середній прогрес: {item.average_progress}%
                        </li>
                    ))
                ) : (
                    <li>Немає активності для відображення.</li>
                )}
            </ul>
        </div>
    );
};

export default Activity;
