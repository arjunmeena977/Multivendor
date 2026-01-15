import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);

    const handleCheckout = async () => {
        try {
            const items = cart.map(item => ({ productId: item.id, qty: item.qty }));
            await api.post('/orders', { items });
            alert('Order placed successfully!');
            clearCart();
            navigate('/orders');
        } catch (error) {
            alert('Checkout failed: ' + (error.response?.data?.error || error.message));
        }
    };

    if (cart.length === 0) return <h3>Cart is empty</h3>;

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h1>Shopping Cart</h1>
            {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', padding: '0.5rem 0' }}>
                    <div>
                        <h4>{item.title}</h4>
                        <p>${item.price} x {item.qty}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
            ))}
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <h3>Total: ${total.toFixed(2)}</h3>
                <button
                    onClick={handleCheckout}
                    style={{ background: '#28a745', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
                >
                    Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;
