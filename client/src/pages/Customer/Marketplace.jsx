import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.get('/public/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-center text-secondary">Loading Marketplace...</div>;

    // Helper to safely get shop name
    const getShopName = (vendorId) => {
        if (vendorId && typeof vendorId === 'object' && vendorId.shopName) {
            return vendorId.shopName;
        }
        return 'Unknown Vendor';
    };

    return (
        <div className="container">
            <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Marketplace</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Discover the best products from our top vendors</p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '1rem' }}
                    />
                </div>
            </header>

            {filteredProducts.length === 0 ? (
                <div className="card text-center p-8">
                    <h3>No products found</h3>
                    <p className="text-secondary">Try adjusting your search terms or verify that vendors have visible approved products.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredProducts.map((p, index) => (
                        <div key={p.id || p._id || index} className="card flex flex-col justify-between" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                            <div style={{ height: '160px', background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: '3rem' }}>
                                🛍️
                            </div>
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>{p.title}</h3>
                                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        ${p.price}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.description || 'No description available.'}
                                </p>

                                <div className="flex justify-between items-center mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffedd5', color: '#9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {getShopName(p.vendorId).charAt(0)}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {getShopName(p.vendorId)}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: p.stock > 0 ? '#166534' : '#991b1b' }}>
                                        {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '0 1.5rem 1.5rem' }}>
                                <button
                                    onClick={() => addToCart(p)}
                                    disabled={p.stock <= 0}
                                    style={{ width: '100%', background: p.stock > 0 ? 'var(--primary-color)' : '#9ca3af' }}
                                >
                                    {p.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
