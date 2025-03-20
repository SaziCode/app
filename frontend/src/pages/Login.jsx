import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // для перенаправлення
import '../components/Auth.css';
const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Для перенаправлення після успішного входу

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Sending login data:', formData); // Логування даних перед відправкою
    
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
    
            const data = await response.json();
            console.log('Login response:', data); // Логування відповіді від сервера
    
            setMessage(data.message);
    
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/'); // Перенаправлення на головну сторінку після успішного входу
            }
        } catch (error) {
            console.error('Error during login:', error); // Логування помилок на фронтенді
            setMessage('Помилка сервера');
        }
    };

    return (
        <div className="auth-container">
    <div className="auth-card">
        <h2>Вхід</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Пароль"
                onChange={handleChange}
                value={formData.password}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Завантаження...' : 'Увійти'}
            </button>
        </form>
        {message && <p>{message}</p>}
        <p>
            Не має акаунта? <a href="/register">Зареєструватись</a>
        </p>
    </div>
</div>
    );
};

export default Login;
