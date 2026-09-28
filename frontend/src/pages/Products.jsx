import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Products.css';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      {/* NAVBAR */}
      <nav>
       <Link to="/home" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
  <img
    src={logo}
    alt="Life Tours and Travels"
    style={{ height: '50px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
  />
</Link>
        <ul className="nav-links">
          <li><a href="/home">Home</a></li>
          <li><a href="/products">Products</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button onClick={handleLogout} className="nav-btn" style={{ background: '#dc3545' }}>
          Logout
        </button>
      </nav>

      <div className="products-page">
        <div className="products-header">
          <h1>Our Products</h1>
          <p>Discover amazing travel products and services</p>
        </div>

        {error && <div className="error">{error}</div>}

        {products.length === 0 ? (
          <div className="no-products">No products available yet.</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="placeholder-image">📦</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">Rs. {product.price}</p>
                  <p className="product-stock">In Stock: {product.stock}</p>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;