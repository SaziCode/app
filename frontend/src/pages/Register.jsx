import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const data = { name, email, password };

        console.log('Sending data:', data);  // Перевірка даних перед відправкою

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Registration successful:', result);
                navigate('/login');
            } else {
                console.log('Registration failed:', result.message);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div className="auth-container">
    <div className="auth-card">
        <h2>Реєстрація</h2>
        <form onSubmit={handleRegister}>
            <div>
                <label htmlFor="name">Ім'я:</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button type="submit">Зареєструватися</button>
        </form>
        <p>
            Маєш профіль? <Link to="/login">Увійти</Link>
        </p>
    </div>
</div>
    );
};

export default Register;
