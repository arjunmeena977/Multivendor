import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ padding: '1rem', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold' }}>MultiVendor Marketplace</Link>

            <div style={{ display: 'flex', gap: '1rem' }}>
                {user ? (
                    <>
                        <span>Hello, {user.name} ({user.role})</span>
                        {user.role === 'VENDOR' && <Link to="/vendor/dashboard" style={{ color: '#aaf' }}>Dashboard</Link>}
                        {user.role === 'ADMIN' && <Link to="/admin/dashboard" style={{ color: '#aaf' }}>Dashboard</Link>}
                        {user.role === 'CUSTOMER' && <Link to="/cart" style={{ color: '#aaf' }}>Cart</Link>}
                        {user.role === 'CUSTOMER' && <Link to="/orders" style={{ color: '#aaf' }}>My Orders</Link>}
                        <button onClick={handleLogout} style={{ background: '#f55', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#fff' }}>Login</Link>
                        <Link to="/register" style={{ color: '#fff' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
