import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/me')
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-8">Loading orders...</div>;

    if (orders.length === 0) {
        return (
            <div className="container flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <h2>No orders yet</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You haven't placed any orders yet.</p>
                <Link to="/">
                    <button>Browse Products</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <h1 className="mb-4">My Orders</h1>

            <div className="flex flex-col gap-4">
                {orders.map(order => {
                    const orderId = order.id || order._id;
                    const displayId = orderId ? orderId.toString().slice(-6).toUpperCase() : 'N/A';

                    return (
                        <div key={orderId} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Placed</div>
                                    <div style={{ fontWeight: '600' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</div>
                                    <div style={{ fontWeight: '600' }}>${order.totalAmount}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order #</div>
                                    <div style={{ fontWeight: '600' }}>{displayId}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</div>
                                    <div>
                                        <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-warning'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                {order.items.map((item, index) => (
                                    <div key={item.id || item._id || index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: index !== order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                        <div style={{ width: '60px', height: '60px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', fontSize: '1.5rem' }}>
                                            🛍️
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                                                {item.productId?.title || 'Unknown Product'}
                                                {/* Use item.productId if populated, or item.product if embedded differently. Checking schema: it is populated. */}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                Qty: {item.qty}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            ${item.lineTotal}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrders;
