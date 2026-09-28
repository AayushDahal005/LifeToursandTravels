import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './PaymentStatus.css';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  const [downloading, setDownloading] = useState({ ticket: false, invoice: false });
  const [error, setError] = useState('');

  const downloadFile = async (type) => {
    if (!bookingId) return;

    setDownloading((prev) => ({ ...prev, [type]: true }));
    setError('');

    try {
      const endpoint = type === 'ticket'
        ? `/bookings/${bookingId}/ticket`
        : `/bookings/${bookingId}/invoice`;

      const response = await api.get(endpoint, {
        responseType: 'blob', // Important for binary PDF
      });

      // Create download link
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
      setError(`Failed to download ${type}. Please try again.`);
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav>
        <Link to="/home" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Life Tours" style={{ height: '50px', cursor: 'pointer' }} />
        </Link>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
        </ul>
      </nav>

      <div className="status-page">
        <div className="status-card success">
          <div className="status-icon success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p className="status-message">
            Thank you for your booking. Your ticket has been confirmed. You can now
            download your e-ticket and invoice below.
          </p>

          {bookingId && (
            <div className="booking-ref">
              <span className="ref-label">Booking Reference</span>
              <span className="ref-value">#{bookingId}</span>
            </div>
          )}

          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '10px 15px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {/* Download Buttons */}
          <div className="download-actions">
            <button
              onClick={() => downloadFile('ticket')}
              className="download-btn ticket-btn"
              disabled={downloading.ticket}
            >
              <span className="download-icon">🎫</span>
              <div className="download-text">
                <strong>{downloading.ticket ? 'Downloading...' : 'Download E-Ticket'}</strong>
                <span>PDF • Boarding pass</span>
              </div>
            </button>

            <button
              onClick={() => downloadFile('invoice')}
              className="download-btn invoice-btn"
              disabled={downloading.invoice}
            >
              <span className="download-icon">🧾</span>
              <div className="download-text">
                <strong>{downloading.invoice ? 'Downloading...' : 'Download Invoice'}</strong>
                <span>PDF • Payment receipt</span>
              </div>
            </button>
          </div>

          <div className="status-actions">
            <button onClick={() => navigate('/home')} className="status-btn primary">
              Book Another Flight
            </button>
          </div>

          <p className="status-note">
            💡 Keep your booking reference safe. You'll need it for check-in.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;