import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    setErrors({});

    // Log the data being sent
    console.log('Sending registration data:', formData);

    try {
      const response = await api.post('/register', formData);
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        // Save token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to home
        navigate('/home');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Logo */}
        <div className="register-header">
          <img 
            src={logo} 
            alt="Life Tours and Travels" 
            style={{ 
              height: '60px', 
              width: 'auto',
              display: 'block',
              margin: '0 auto 10px',
              objectFit: 'contain'
            }} 
          />
          <h2>Create Account</h2>
          <p>Join Life Tours and Travels</p>
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="error-message">{serverError}</div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <span className="field-error">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="+977-XXXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              placeholder="Kathmandu, Nepal"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="field-error">{errors.address[0]}</span>}
          </div>

          {/* Password Field - FIXED */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>

          {/* Confirm Password Field - FIXED */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm your password"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Login Link */}
        <div className="login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="register-bg-decoration">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
    </div>
  );
}

export default Register;