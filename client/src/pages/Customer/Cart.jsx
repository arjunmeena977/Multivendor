import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

    const handleCheckout = async () => {
        try {
            const items = cart.map(item => ({ productId: item.id || item._id, qty: item.qty }));
            const res = await api.post('/orders', { items });
            alert('Order placed successfully!');
            clearCart();
            navigate('/orders');
        } catch (error) {
            alert('Checkout failed: ' + (error.response?.data?.error || error.message));
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <h2>Your cart is empty</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button>Start Shopping</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <h1 className="mb-4">Shopping Cart ({cart.length} items)</h1>

            <div className="card mb-4">
                {cart.map(item => (
                    <div key={item.id || item._id} className="flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div className="flex gap-4 items-center">
                            <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verified Vendor</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantity</div>
                                <div style={{ fontWeight: '600' }}>{item.qty}</div>
                            </div>
                            <div className="text-center" style={{ minWidth: '80px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Price</div>
                                <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>${(Number(item.price) * item.qty).toFixed(2)}</div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id || item._id)}
                                style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem'
                                }}
                                title="Remove Item"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)' }}>
                    <button
                        onClick={clearCart}
                        style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                    >
                        Clear Cart
                    </button>
                    <div className="text-right">
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Amount</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>${total.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Link to="/">
                    <button style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>Continue Shopping</button>
                </Link>
                <button
                    onClick={handleCheckout}
                    className="flex items-center gap-2"
                    style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                >
                    Proceed to Checkout ➜
                </button>
            </div>
        </div>
    );
};

export default Cart;
