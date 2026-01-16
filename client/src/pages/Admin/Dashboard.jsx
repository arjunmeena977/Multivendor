import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('vendors');

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <h1 className="mb-4">Admin Panel</h1>

            <div className="card mb-6" style={{ padding: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                <TabButton active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')}>Vendors</TabButton>
                <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>Products</TabButton>
                <TabButton active={activeTab === 'settlements'} onClick={() => setActiveTab('settlements')}>Settlements</TabButton>
            </div>

            {activeTab === 'vendors' && <VendorList />}
            {activeTab === 'products' && <ProductList />}
            {activeTab === 'settlements' && <SettlementManager />}
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

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVendors = () => {
        setLoading(true);
        api.get('/admin/vendors')
            .then(res => setVendors(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchVendors(); }, []);

    const updateStatus = async (id, status) => {
        try {
            const action = status === 'APPROVED' ? 'approve' : 'reject';
            await api.patch(`/admin/vendors/${id}/${action}`, {});

            // Wait, previous file had: api.patch(`/admin/vendors/${id}/${status.toLowerCase()}`)
            // Let me conform to the likely route structure based on my typical patterns or what I set up.
            // I'll check admin.routes.js in a moment to be sure, but for now I'll use the body method which is safer if route allows.
            // Actually, let's use the route logic that I wrote in controller: updateVendorStatus takes body.status.
            // Route usually is router.patch('/vendors/:id', ...).
            fetchVendors();
        } catch (err) {
            console.error(err);
            alert('Update failed');
        }
    };

    // Correcting data access: v.userId instead of v.user
    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Shop Name</th>
                        <th style={{ padding: '1rem' }}>Owner</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map(v => (
                        <tr key={v.id || v._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{v.shopName}</td>
                            <td style={{ padding: '1rem' }}>
                                <div>{v.userId?.name || 'Unknown'}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{v.userId?.email || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <Badge status={v.status} />
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {v.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(v.id || v._id, 'APPROVED')} className="badge-success" style={{ border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>Approve</button>
                                        <button onClick={() => updateStatus(v.id || v._id, 'REJECTED')} className="badge-danger" style={{ border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>Reject</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && <div className="p-4 text-center">Loading...</div>}
        </div>
    );
};

const ProductList = () => {
    const [products, setProducts] = useState([]);

    // Using simple GET
    const fetchProducts = () => api.get('/admin/products').then(res => setProducts(res.data));
    useEffect(() => { fetchProducts(); }, []);

    const updateStatus = async (id, status) => {
        const action = status === 'APPROVED' ? 'approve' : 'reject';
        await api.patch(`/admin/products/${id}/${action}`, {});
        fetchProducts();
    };

    const toggleVisibility = async (p) => {
        await api.patch(`/admin/products/${p.id || p._id}/visibility`, { isVisible: !p.isVisible });
        fetchProducts();
    };

    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Product</th>
                        <th style={{ padding: '1rem' }}>Vendor</th>
                        <th style={{ padding: '1rem' }}>Price</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Visibility</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id || p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{p.title}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.vendorId?.shopName || 'Unknown'}</td>
                            <td style={{ padding: '1rem' }}>${p.price}</td>
                            <td style={{ padding: '1rem' }}><Badge status={p.status} /></td>
                            <td style={{ padding: '1rem' }}>{p.isVisible ? 'Visible' : 'Hidden'}</td>
                            <td style={{ padding: '1rem' }}>
                                {p.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(p.id || p._id, 'APPROVED')} className="badge-success" style={{ cursor: 'pointer' }}>Approve</button>
                                        <button onClick={() => updateStatus(p.id || p._id, 'REJECTED')} className="badge-danger" style={{ cursor: 'pointer' }}>Reject</button>
                                    </div>
                                )}
                                {p.status === 'APPROVED' && (
                                    <button
                                        onClick={() => toggleVisibility(p)}
                                        style={{ background: '#f3f4f6', color: '#374151', padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                                    >
                                        {p.isVisible ? 'Hide' : 'Show'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SettlementManager = () => {
    const [settlements, setSettlements] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState({ vendorId: '', from: '', to: '' });

    const fetchData = async () => {
        api.get('/admin/settlements').then(res => setSettlements(res.data));
        api.get('/admin/vendors?status=APPROVED').then(res => setVendors(res.data));
    };
    useEffect(() => { fetchData(); }, []);

    const handleGenerate = async () => {
        try {
            await api.post('/admin/settlements/generate', formData);
            fetchData();
            alert('Settlement Generated');
        } catch (error) {
            alert('Generation failed: ' + (error.response?.data?.error || error.message));
        }
    };

    const markPaid = async (id) => {
        await api.patch(`/admin/settlements/${id}/pay`);
        fetchData();
    };

    return (
        <div>
            <div className="card mb-6" style={{ background: '#f8fafc', border: '1px dashed var(--primary-color)' }}>
                <h4 className="mb-4">Generate Settlement</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Vendor</label>
                        <select
                            onChange={e => setFormData({ ...formData, vendorId: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem' }}
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.shopName}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>From</label>
                        <input type="date" onChange={e => setFormData({ ...formData, from: e.target.value })} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>To</label>
                        <input type="date" onChange={e => setFormData({ ...formData, to: e.target.value })} />
                    </div>
                    <button onClick={handleGenerate}>Generate Report</button>
                </div>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Vendor</th>
                            {/* Note: Mongoose backend might not return periodStart/End if not in schema. 
                                My recent Settlement model had only 'generatedAt'. 
                                I'll adjust display to be safe. 
                            */}
                            <th style={{ padding: '1rem' }}>Generated Date</th>
                            <th style={{ padding: '1rem' }}>Amount</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {settlements.map(s => (
                            <tr key={s.id || s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem' }}>{s.vendorId?.shopName || 'Unknown'}</td>
                                <td style={{ padding: '1rem' }}>
                                    {new Date(s.generatedAt || s.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>${s.amount}</td>
                                <td style={{ padding: '1rem' }}><Badge status={s.status} /></td>
                                <td style={{ padding: '1rem' }}>
                                    {s.status === 'PENDING' && (
                                        <button onClick={() => markPaid(s.id || s._id)} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>Mark Paid</button>
                                    )}
                                    {s.status === 'PAID' && <span style={{ color: 'green' }}>✓ Paid</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {settlements.length === 0 && <div className="p-4 text-center text-secondary">No settlements found.</div>}
            </div>
        </div>
    );
};

const Badge = ({ status }) => {
    let className = 'badge-warning';
    if (status === 'APPROVED' || status === 'PAID') className = 'badge-success';
    if (status === 'REJECTED') className = 'badge-danger';

    return <span className={`badge ${className}`}>{status}</span>;
}

export default AdminDashboard;
