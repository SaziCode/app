import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Activity = ({ userId }) => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/activity-graph`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setActivity(response.data);
    })
    .catch(error => {
      console.error('Помилка при отриманні графіку активності:', error);
    });
  }, [userId]);

  return (
    <div>
      <h2>Графік активності</h2>
      <ul>
        {activity.map((item, index) => (
          <li key={index}>{item.month}: {item.completed_tasks} завдань</li>
        ))}
      </ul>
    </div>
  );
};

export default Activity;