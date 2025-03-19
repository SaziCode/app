import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Users = ({ userId }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setUsers(response.data);
    })
    .catch(error => {
      console.error('Помилка при отриманні користувачів:', error);
    });
  }, [userId]);

  return (
    <div>
      <h2>Користувачі</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Users;