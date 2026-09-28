import React, { useState, useEffect } from 'react';
import api from '../services/api';

function TestAPI() {
    const [message, setMessage] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Test the API connection
        testConnection();
    }, []);

    const testConnection = async () => {
        setLoading(true);
        try {
            const response = await api.get('/test');
            setMessage(response.data.message);
        } catch (error) {
            console.error('API Error:', error);
            setMessage('Failed to connect to backend');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>React + Laravel Connection Test</h1>
            <div style={{ marginBottom: '20px' }}>
                <h2>Status: {loading ? 'Loading...' : (message || 'Ready to test')}</h2>
                <button onClick={testConnection} disabled={loading} style={{ marginRight: '10px' }}>
                    Test Connection
                </button>
                <button onClick={fetchProducts} disabled={loading}>
                    Fetch Products
                </button>
            </div>
            <div>
                <h3>Products:</h3>
                {products.length > 0 ? (
                    <ul>
                        {products.map(product => (
                            <li key={product.id}>
                                {product.name} - ${product.price}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No products loaded. Click "Fetch Products" button.</p>
                )}
            </div>
        </div>
    );
}

export default TestAPI;