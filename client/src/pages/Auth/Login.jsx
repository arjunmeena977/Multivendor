import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'ADMIN') navigate('/admin/dashboard');
            else if (user.role === 'VENDOR') navigate('/vendor/dashboard');
            else navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    style={{ padding: '0.5rem' }}
                />
                <input
                    type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    style={{ padding: '0.5rem' }}
                />
                <button type="submit" style={{ padding: '0.7rem', background: '#007bff', color: '#fff', border: 'none' }}>Login</button>
            </form>
        </div>
    );
};

export default Login;
