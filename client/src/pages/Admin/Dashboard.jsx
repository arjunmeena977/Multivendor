import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('vendors');

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={() => setActiveTab('vendors')} disabled={activeTab === 'vendors'}>Vendors</button>
                <button onClick={() => setActiveTab('products')} disabled={activeTab === 'products'}>Products</button>
                <button onClick={() => setActiveTab('settlements')} disabled={activeTab === 'settlements'}>Settlements</button>
            </div>
            {activeTab === 'vendors' && <VendorList />}
            {activeTab === 'products' && <ProductList />}
            {activeTab === 'settlements' && <SettlementManager />}
        </div>
    );
};

const VendorList = () => {
    const [vendors, setVendors] = useState([]);

    const fetchVendors = () => api.get('/admin/vendors').then(res => setVendors(res.data));
    useEffect(() => { fetchVendors(); }, []);

    const updateStatus = async (id, status) => {
        await api.patch(`/admin/vendors/${id}/${status.toLowerCase()}`); // approve or reject
        fetchVendors();
    };

    return (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Shop Name</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                {vendors.map(v => (
                    <tr key={v.id}>
                        <td>{v.shopName}</td>
                        <td>{v.user.name} ({v.user.email})</td>
                        <td>{v.status}</td>
                        <td>
                            {v.status === 'PENDING' && (
                                <>
                                    <button onClick={() => updateStatus(v.id, 'APPROVE')} style={{ color: 'green' }}>Approve</button>
                                    <button onClick={() => updateStatus(v.id, 'REJECT')} style={{ color: 'red' }}>Reject</button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const fetchProducts = () => api.get('/admin/products').then(res => setProducts(res.data));
    useEffect(() => { fetchProducts(); }, []);

    const updateStatus = async (id, status) => {
        await api.patch(`/admin/products/${id}/${status.toLowerCase()}`);
        fetchProducts();
    };

    const toggleVisibility = async (p) => {
        await api.patch(`/admin/products/${p.id}/visibility`, { isVisible: !p.isVisible });
        fetchProducts();
    };

    return (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Product</th><th>Vendor</th><th>Price</th><th>Status</th><th>Visible</th><th>Actions</th></tr></thead>
            <tbody>
                {products.map(p => (
                    <tr key={p.id}>
                        <td>{p.title}</td>
                        <td>{p.vendor.shopName}</td>
                        <td>{p.price}</td>
                        <td>{p.status}</td>
                        <td>{p.isVisible ? 'YES' : 'NO'}</td>
                        <td>
                            {p.status === 'PENDING' && (
                                <>
                                    <button onClick={() => updateStatus(p.id, 'APPROVE')}>Approve</button>
                                    <button onClick={() => updateStatus(p.id, 'REJECT')}>Reject</button>
                                </>
                            )}
                            {p.status === 'APPROVED' && (
                                <button onClick={() => toggleVisibility(p)}>{p.isVisible ? 'Hide' : 'Show'}</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
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
        await api.post('/admin/settlements/generate', formData);
        fetchData();
        alert('Settlement Generated');
    };

    const markPaid = async (id) => {
        await api.patch(`/admin/settlements/${id}/pay`);
        fetchData();
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5' }}>
                <h4>Generate Settlement</h4>
                <select onChange={e => setFormData({ ...formData, vendorId: e.target.value })}>
                    <option value="">Select Vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.shopName}</option>)}
                </select>
                <input type="date" onChange={e => setFormData({ ...formData, from: e.target.value })} />
                <input type="date" onChange={e => setFormData({ ...formData, to: e.target.value })} />
                <button onClick={handleGenerate}>Generate</button>
            </div>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th>Vendor</th><th>Period</th><th>Gross</th><th>Commission</th><th>Net Pay</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                    {settlements.map(s => (
                        <tr key={s.id}>
                            <td>{s.vendor.shopName}</td>
                            <td>{new Date(s.periodStart).toLocaleDateString()} - {new Date(s.periodEnd).toLocaleDateString()}</td>
                            <td>{s.grossSales}</td>
                            <td>{s.commissionTotal}</td>
                            <td>{s.netPayable}</td>
                            <td>{s.status}</td>
                            <td>
                                {s.status === 'PENDING' && <button onClick={() => markPaid(s.id)}>Mark Paid</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
