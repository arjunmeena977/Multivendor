import { useEffect, useState } from 'react';
import api from '../../api/axios';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        api.get('/orders/me').then(res => setOrders(res.data));
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <h1>My Orders</h1>
            {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        <span><strong>Order ID:</strong> {order.id.slice(0, 8)}</span>
                        <span>Status: <strong>{order.status}</strong></span>
                        <span>Total: <strong>${order.totalAmount}</strong></span>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        {order.items.map(item => (
                            <div key={item.id} style={{ fontSize: '0.9rem', color: '#555' }}>
                                {item.product.title} x {item.qty} - ${item.lineTotal}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyOrders;
