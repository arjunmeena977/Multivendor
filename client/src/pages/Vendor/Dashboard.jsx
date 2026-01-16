import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/vendor/me')
            .then(res => setProfile(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-8">Loading Vendor Profile...</div>;

    if (!profile) return <div className="text-center p-8 text-red-600">Failed to load profile.</div>;

    if (profile.status !== 'APPROVED') {
        return (
            <div className="container" style={{ maxWidth: '600px', marginTop: '4rem' }}>
                <div className="card text-center" style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                    <h2 className="mb-4">Account Application {profile.status === 'PENDING' ? 'Under Review' : 'Status Alert'}</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Your vendor status is currently <span className={`badge ${profile.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>{profile.status}</span>.
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You will be able to manage your shop and products once an administrator approves your application.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="mb-4">Vendor Hub</h1>
            <p className="mb-6 text-secondary">Welcome back, {user?.name} ({profile.shopName})</p>

            <div className="card mb-6" style={{ padding: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>My Products</TabButton>
                <TabButton active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')}>Earnings Report</TabButton>
            </div>

            {activeTab === 'products' && <VendorProducts />}
            {activeTab === 'earnings' && <VendorEarnings />}
        </div>
    );
};

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            background: active ? 'var(--primary-color)' : 'transparent',
            color: active ? 'white' : 'var(--text-main)',
            border: active ? 'none' : '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.6rem 1.2rem',
            cursor: 'pointer',
            fontWeight: '600',
            whiteSpace: 'nowrap'
        }}
    >
        {children}
    </button>
);

const VendorProducts = () => {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ title: '', price: '', stock: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProducts = () => {
        api.get('/vendor/products').then(res => setProducts(res.data));
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
            if (editingId) {
                await api.put(`/vendor/products/${editingId}`, data);
                // Note: Check vendor.controller.js implementation for PUT vs PATCH. 
                // The current controller uses `updateProduct` at some route.
                // Assuming PUT /vendor/products/:id is mapped to updateProduct in routes.
            } else {
                await api.post('/vendor/products', data);
            }
            setForm({ title: '', price: '', stock: '', description: '' });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete product?')) {
            await api.delete(`/vendor/products/${id}`);
            fetchProducts();
        }
    };

    const handleEdit = (p) => {
        setForm({ title: p.title, price: p.price, stock: p.stock, description: p.description || '' });
        setEditingId(p.id || p._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card h-fit">
                <h3 className="mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-secondary text-sm block mb-1">Product Title</label>
                        <input placeholder="Ex: Wireless Headphones" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-full">
                            <label className="text-secondary text-sm block mb-1">Price ($)</label>
                            <input placeholder="0.00" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                        </div>
                        <div className="w-full">
                            <label className="text-secondary text-sm block mb-1">Stock Qty</label>
                            <input placeholder="0" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-secondary text-sm block mb-1">Description</label>
                        <textarea
                            rows="4"
                            placeholder="Describe your product..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setForm({ title: '', price: '', stock: '', description: '' }); }}
                                style={{ background: '#f3f4f6', color: '#374151' }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                <h3 className="mb-4">Product List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '0.8rem' }}>Product</th>
                            <th style={{ padding: '0.8rem' }}>Price</th>
                            <th style={{ padding: '0.8rem' }}>Stock</th>
                            <th style={{ padding: '0.8rem' }}>Status</th>
                            <th style={{ padding: '0.8rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => {
                            const id = p.id || p._id;
                            return (
                                <tr key={id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.8rem', fontWeight: '500' }}>{p.title}</td>
                                    <td style={{ padding: '0.8rem' }}>${p.price}</td>
                                    <td style={{ padding: '0.8rem' }}>{p.stock}</td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <span className={`badge ${p.status === 'APPROVED' ? 'badge-success' : p.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(p)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#e0e7ff', color: '#4338ca' }}>Edit</button>
                                            <button onClick={() => handleDelete(id)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b' }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {products.length === 0 && <div className="p-4 text-center text-secondary">No products found.</div>}
            </div>
        </div>
    );
};

const VendorEarnings = () => {
    const [earnings, setEarnings] = useState(null);
    const [dates, setDates] = useState({ from: '', to: '' });
    const [loading, setLoading] = useState(false);

    const fetchEarnings = async () => {
        if (!dates.from || !dates.to) return alert('Please select both start and end dates');
        setLoading(true);
        try {
            const res = await api.get(`/vendor/earnings?from=${dates.from}&to=${dates.to}`);
            setEarnings(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch earnings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="card mb-6" style={{ background: '#f8fafc', border: '1px dashed var(--primary-color)' }}>
                <h4 className="mb-4">Earnings Report</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>From</label>
                        <input type="date" value={dates.from} onChange={e => setDates({ ...dates, from: e.target.value })} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>To</label>
                        <input type="date" value={dates.to} onChange={e => setDates({ ...dates, to: e.target.value })} />
                    </div>
                    <button onClick={fetchEarnings} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {earnings && (
                <div className="card">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#e0e7ff', padding: '1.5rem', borderRadius: '8px' }}>
                            <div style={{ color: '#4338ca', fontWeight: '600', marginBottom: '0.5rem' }}>Total Earnings</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#312e81' }}>${earnings.summary?.totalEarnings || 0}</div>
                        </div>
                        {/* Removed Total Sales as backend doesn't compute it easily right now due to migration limits */}
                    </div>

                    <h4 className="mb-4">Transaction Details</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Earning Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.details?.map((item, idx) => (
                                <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#166534' }}>
                                        ${item.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!earnings.details || earnings.details.length === 0) && <div className="p-4 text-center text-secondary">No transactions found for this period.</div>}
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
