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
        <nav style={{
            background: 'var(--surface-color)',
            borderBottom: '1px solid var(--border-color)',
            height: 'var(--nav-height)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="container" style={{ height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem' }}>
                <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                    MultiVendor<span style={{ color: 'var(--text-main)' }}>Marketplace</span>
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <div className="flex items-center gap-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name.charAt(0)}
                                </div>
                                <span className="hidden-mobile">{user.name}</span>
                            </div>

                            <div className="flex gap-4">
                                {user.role === 'VENDOR' && <Link to="/vendor/dashboard" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Dashboard</Link>}
                                {user.role === 'ADMIN' && <Link to="/admin/dashboard" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Dashboard</Link>}
                                {user.role === 'CUSTOMER' && <Link to="/cart" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Cart</Link>}
                                {user.role === 'CUSTOMER' && <Link to="/orders" style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>My Orders</Link>}
                            </div>

                            <button onClick={handleLogout} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Login</Link>
                            <Link to="/register">
                                <button style={{ padding: '0.4rem 1.2rem' }}>Register</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
