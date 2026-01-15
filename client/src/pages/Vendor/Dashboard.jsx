import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        api.get('/vendor/me').then(res => setProfile(res.data));
    }, []);

    if (!profile) return <div>Loading Profile...</div>;

    if (profile.status !== 'APPROVED') {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff3cd', color: '#856404' }}>
                <h2>Dashboard Locked</h2>
                <p>Your vendor account status is <strong>{profile.status}</strong>.</p>
                <p>You can manage products only after Admin approval.</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Vendor Dashboard</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={() => setActiveTab('products')} disabled={activeTab === 'products'}>My Products</button>
                <button onClick={() => setActiveTab('earnings')} disabled={activeTab === 'earnings'}>Earnings Report</button>
            </div>

            {activeTab === 'products' && <VendorProducts />}
            {activeTab === 'earnings' && <VendorEarnings />}
        </div>
    );
};

const VendorProducts = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ title: '', price: '', stock: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchProducts = () => api.get('/vendor/products').then(res => setProducts(res.data));

    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/vendor/products/${editingId}`, { ...form, price: Number(form.price), stock: Number(form.stock) });
            } else {
                await api.post('/vendor/products', { ...form, price: Number(form.price), stock: Number(form.stock) });
            }
            setForm({ title: '', price: '', stock: '', description: '' });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete product?')) {
            await api.delete(`/vendor/products/${id}`);
            fetchProducts();
        }
    };

    const handleEdit = (p) => {
        setForm({ title: p.title, price: p.price, stock: p.stock, description: p.description });
        setEditingId(p.id);
    };

    return (
        <div>
            <h3>Product Management</h3>
            <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '1rem', marginBottom: '1rem' }}>
                <h4>{editingId ? 'Edit Product' : 'Add New Product'}</h4>
                <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <button type="submit">{editingId ? 'Update' : 'Create'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', price: '', stock: '', description: '' }); }}>Cancel</button>}
            </form>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Visible</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.title}</td>
                            <td>{p.price}</td>
                            <td>{p.stock}</td>
                            <td>{p.status}</td>
                            <td>{p.isVisible ? 'Yes' : 'No'}</td>
                            <td>
                                <button onClick={() => handleEdit(p)}>Edit</button>
                                <button onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const VendorEarnings = () => {
    const [earnings, setEarnings] = useState(null);
    const [dates, setDates] = useState({ from: '', to: '' });

    const fetchEarnings = async () => {
        if (!dates.from || !dates.to) return alert('Select dates');
        const res = await api.get(`/vendor/earnings?from=${dates.from}&to=${dates.to}`);
        setEarnings(res.data);
    };

    return (
        <div>
            <h3>Earnings Report</h3>
            <div style={{ marginBottom: '1rem' }}>
                <input type="date" value={dates.from} onChange={e => setDates({ ...dates, from: e.target.value })} />
                <input type="date" value={dates.to} onChange={e => setDates({ ...dates, to: e.target.value })} />
                <button onClick={fetchEarnings}>Generate Report</button>
            </div>

            {earnings && (
                <div>
                    <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: '#eee' }}>
                        <div><strong>Total Sales:</strong> ${earnings.summary.totalSales}</div>
                        <div><strong>My Earnings:</strong> ${earnings.summary.totalEarnings}</div>
                    </div>
                    <table border="1" style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Sale Amount</th>
                                <th>Commission (10%)</th>
                                <th>Net Earning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.details.map(item => (
                                <tr key={item.id}>
                                    <td>{item.orderItem.product.title}</td>
                                    <td>${item.orderItem.lineTotal}</td>
                                    <td>${item.commissionAmount}</td>
                                    <td>${item.vendorEarning}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
