import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER', shopName: '' });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input name="name" placeholder="Name" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ padding: '0.5rem' }} />

                <select name="role" onChange={handleChange} value={form.role} style={{ padding: '0.5rem' }}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                </select>

                {form.role === 'VENDOR' && (
                    <input name="shopName" placeholder="Shop Name" onChange={handleChange} required style={{ padding: '0.5rem' }} />
                )}

                <button type="submit" style={{ padding: '0.7rem', background: '#28a745', color: '#fff', border: 'none' }}>Register</button>
            </form>
        </div>
    );
};

export default Register;
