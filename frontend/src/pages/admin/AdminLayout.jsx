import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Admin.css';

function AdminLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/flights', label: 'Manage Flights', icon: '✈️' },
    { path: '/admin/bookings', label: 'Manage Bookings', icon: '🎫' },
    { path: '/admin/users', label: 'Manage Users', icon: '👥' },
  ];

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="Life Tours" className="sidebar-logo" />
          <span className="sidebar-brand-text">Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/home" className="sidebar-link">
            <span className="sidebar-icon">🏠</span>
            <span className="sidebar-label">Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle Sidebar"
          >
            ☰
          </button>

          <div className="topbar-title">Life Tours &amp; Travels — Admin</div>

          <div className="topbar-user">
            <div className="topbar-user-info">
              <div className="topbar-user-name">{user?.name || 'Admin'}</div>
              <div className="topbar-user-role">Administrator</div>
            </div>
            <button className="topbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
