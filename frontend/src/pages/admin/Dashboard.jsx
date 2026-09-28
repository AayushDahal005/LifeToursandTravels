import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  const { stats, popular_routes, recent_bookings } = data;

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: '👥', color: '#2E86AB' },
    { label: 'Total Flights', value: stats.total_flights, icon: '✈️', color: '#F2A541' },
    { label: 'Total Bookings', value: stats.total_bookings, icon: '🎫', color: '#10B981' },
    { label: 'Revenue (Rs.)', value: Number(stats.revenue).toLocaleString(), icon: '💰', color: '#DC2626' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F2A541';
      case 'failed': return '#DC2626';
      case 'cancelled': return '#6B7280';
      default: return '#5A6B7A';
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your business performance</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-icon" style={{ background: card.color + '20', color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SECONDARY STATS */}
      <div className="mini-stats">
        <div className="mini-stat"><span className="mini-label">Paid</span><span className="mini-value" style={{color:'#10B981'}}>{stats.paid_bookings}</span></div>
        <div className="mini-stat"><span className="mini-label">Pending</span><span className="mini-value" style={{color:'#F2A541'}}>{stats.pending_bookings}</span></div>
        <div className="mini-stat"><span className="mini-label">Failed</span><span className="mini-value" style={{color:'#DC2626'}}>{stats.failed_bookings}</span></div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="dash-grid">
        {/* Popular Routes */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Routes</h2>
          </div>
          {popular_routes.length === 0 ? (
            <div className="empty-state">No data yet</div>
          ) : (
            <div className="routes-list">
              {popular_routes.map((route, i) => (
                <div className="route-row" key={i}>
                  <div className="route-rank">{i + 1}</div>
                  <div className="route-info">
                    <div className="route-name">{route.from_city} → {route.to_city}</div>
                    <div className="route-meta">{route.total_bookings} bookings</div>
                  </div>
                  <div className="route-revenue">Rs. {Number(route.revenue).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Bookings</h2>
            <button className="link-btn" onClick={() => navigate('/admin/bookings')}>
              View All
            </button>
          </div>
          {recent_bookings.length === 0 ? (
            <div className="empty-state">No bookings yet</div>
          ) : (
            <div className="recent-list">
              {recent_bookings.map((b) => (
                <div className="recent-row" key={b.id}>
                  <div className="recent-info">
                    <div className="recent-name">{b.user?.name || 'Unknown'}</div>
                    <div className="recent-meta">{b.flight?.from_city} → {b.flight?.to_city}</div>
                  </div>
                  <div className="recent-right">
                    <div className="recent-amount">Rs. {Number(b.total_amount).toLocaleString()}</div>
                    <span className="status-pill" style={{ background: statusColor(b.payment_status) + '20', color: statusColor(b.payment_status) }}>
                      {b.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;