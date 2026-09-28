import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './MyBookings.css';

function MyBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/my-bookings');
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const downloadFile = async (bookingId, type) => {
    const key = `${bookingId}-${type}`;
    setDownloading((prev) => ({ ...prev, [key]: true }));

    try {
      const endpoint = type === 'ticket'
        ? `/bookings/${bookingId}/ticket`
        : `/bookings/${bookingId}/invoice`;

      const response = await api.get(endpoint, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Download ${type} failed:`, err);
      alert(`Failed to download ${type}`);
    } finally {
      setDownloading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusColor = (s) => ({
    paid: '#10B981',
    pending: '#F2A541',
    failed: '#DC2626',
    cancelled: '#6B7280',
  }[s] || '#5A6B7A');

  return (
    <div>
      {/* NAVBAR */}
      <nav>
        <Link to="/home" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Life Tours"
            style={{ height: '50px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
          />
        </Link>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate('/home')} className="nav-btn" style={{ background: '#2E86AB' }}>
            ← Back to Home
          </button>
          <button onClick={handleLogout} className="nav-btn" style={{ background: '#dc3545' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="my-bookings-page">
        <div className="my-bookings-header">
          <div>
            <h1>My Bookings</h1>
            <p>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {loading ? (
          <div className="bookings-loading">
            <div className="spinner"></div>
            <p>Loading your bookings…</p>
          </div>
        ) : error ? (
          <div className="bookings-error">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="empty-icon">🎫</div>
            <h3>No bookings yet</h3>
            <p>You haven't booked any flights. Start exploring!</p>
            <button onClick={() => navigate('/home')} className="browse-btn">
              Browse Flights
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((b) => (
              <div className="booking-card" key={b.id}>
                {/* Header */}
                <div className="bc-header">
                  <div className="bc-ref">
                    <span className="bc-ref-label">Reference</span>
                    <span className="bc-ref-value">{b.transaction_uuid}</span>
                  </div>
                  <span
                    className="bc-status"
                    style={{
                      background: statusColor(b.payment_status) + '20',
                      color: statusColor(b.payment_status),
                    }}
                  >
                    {b.payment_status}
                  </span>
                </div>

                {/* Body */}
                <div className="bc-body">
                  <div className="bc-left">
                    <div className="bc-route">
                      <div className="bc-city">
                        <span className="bc-time">{formatTime(b.flight?.departure_time)}</span>
                        <span className="bc-city-name">{b.flight?.from_city}</span>
                      </div>
                      <div className="bc-arrow">✈️ →</div>
                      <div className="bc-city">
                        <span className="bc-time">{formatTime(b.flight?.arrival_time)}</span>
                        <span className="bc-city-name">{b.flight?.to_city}</span>
                      </div>
                    </div>

                    <div className="bc-meta">
                      <span><strong>{b.flight?.airline}</strong> • {b.flight?.flight_number}</span>
                      <span>•</span>
                      <span>{formatDate(b.created_at)}</span>
                      <span>•</span>
                      <span>{b.passengers?.length || 0} passenger{b.passengers?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="bc-right">
                    <div className="bc-amount-label">Total Paid</div>
                    <div className="bc-amount">Rs. {Number(b.total_amount).toLocaleString()}</div>
                  </div>
                </div>

                {/* Passengers preview */}
                <div className="bc-passengers">
                  {b.passengers?.map((p, i) => (
                    <div className="bc-pax" key={i}>
                      <span className="bc-pax-num">{i + 1}</span>
                      <span className="bc-pax-name">{p.title} {p.fullName}</span>
                      <span className="bc-pax-type">{p.type}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {b.payment_status === 'paid' && (
                  <div className="bc-actions">
                    <button
                      onClick={() => downloadFile(b.id, 'ticket')}
                      disabled={downloading[`${b.id}-ticket`]}
                      className="bc-btn ticket"
                    >
                      🎫 {downloading[`${b.id}-ticket`] ? 'Downloading…' : 'E-Ticket'}
                    </button>
                    <button
                      onClick={() => downloadFile(b.id, 'invoice')}
                      disabled={downloading[`${b.id}-invoice`]}
                      className="bc-btn invoice"
                    >
                      🧾 {downloading[`${b.id}-invoice`] ? 'Downloading…' : 'Invoice'}
                    </button>
                  </div>
                )}

                {b.payment_status === 'pending' && (
                  <div className="bc-note pending">
                    ⏳ Payment pending. Complete your payment to receive the e-ticket.
                  </div>
                )}

                {b.payment_status === 'cancelled' && (
                  <div className="bc-note cancelled">
                    ❌ This booking has been cancelled.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;