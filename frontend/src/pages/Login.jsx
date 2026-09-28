import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './Login.css';

function Login() {
  const [loginType, setLoginType] = useState('user'); // 'user' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear old session when login page loads
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }, []);

  // Reset fields when switching tabs
  const handleTabChange = (type) => {
    setLoginType(type);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      const response = await api.post('/login', {
        email: email.trim(),
        password: password,
      });

      if (!response.data.success) {
        setError(response.data.message || 'Login failed');
        setLoading(false);
        return;
      }

      const userRole = response.data.user?.role;

      // Role validation per tab
      if (loginType === 'admin' && userRole !== 'admin') {
        setError('This account is not an administrator. Use the User Login tab.');
        setLoading(false);
        return;
      }

      if (loginType === 'user' && userRole === 'admin') {
        // Allow admin login through user tab but redirect appropriately
        // OR block it. Uncomment below to block:
        // setError('Please use the Admin Login tab for admin accounts.');
        // setLoading(false);
        // return;
      }

      // Save session
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure Laravel is running.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAdminTab = loginType === 'admin';

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-header">
          <img
            src={logo}
            alt="Life Tours and Travels"
            style={{
              height: '60px',
              width: 'auto',
              display: 'block',
              margin: '0 auto 10px',
              objectFit: 'contain',
            }}
          />
          <h2>{isAdminTab ? 'Admin Panel' : 'Welcome Back'}</h2>
          <p>
            {isAdminTab
              ? 'Sign in with administrator credentials'
              : 'Sign in to your account to continue'}
          </p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => handleTabChange('user')}
          >
            👤 User Login
          </button>
          <button
            type="button"
            className={`login-tab admin-tab ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabChange('admin')}
          >
            🛡️ Admin Login
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>{isAdminTab ? 'Admin Email' : 'Email Address'}</label>
            <input
              type="email"
              placeholder={isAdminTab ? 'admin@lifetours.com' : 'your@email.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            {!isAdminTab && (
              <a href="#" className="forgot-link">Forgot Password?</a>
            )}
          </div>

          <button
            type="submit"
            className={`login-btn ${isAdminTab ? 'admin-btn-style' : ''}`}
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : isAdminTab
                ? 'Sign In as Admin'
                : 'Sign In'}
          </button>
        </form>

        {/* Sign up link — only for users */}
        {!isAdminTab && (
          <div className="signup-link">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </div>
        )}

        {isAdminTab && (
          <div className="admin-hint">
            🔒 Admin access is restricted to authorized personnel only.
          </div>
        )}
      </div>

      <div className="login-bg-decoration">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
    </div>
  );
}

export default Login;