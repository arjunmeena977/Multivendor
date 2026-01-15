import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

const Marketplace = () => {
    const [products, setProducts] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        api.get('/public/products').then(res => setProducts(res.data));
    }, []);

    return (
        <div>
            <h1>Marketplace</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {products.map(p => (
                    <div key={p.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                        <h3>{p.title}</h3>
                        <p>{p.description}</p>
                        <p><strong>${p.price}</strong></p>
                        <p><small>Vendor: {p.vendor.shopName}</small></p>
                        {p.stock > 0 ? (
                            <button
                                onClick={() => addToCart(p)}
                                style={{ background: '#007bff', color: '#fff', border: 'none', padding: '0.5rem', width: '100%', cursor: 'pointer' }}
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <p style={{ color: 'red' }}>Out of Stock</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
