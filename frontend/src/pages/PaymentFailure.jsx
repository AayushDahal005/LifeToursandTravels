import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './PaymentStatus.css';

function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get('reason') || 'unknown';

  const getReasonMessage = (reason) => {
    switch (reason) {
      case 'cancelled':
        return 'You cancelled the payment. No amount was deducted.';
      case 'verification_failed':
        return 'We could not verify the payment with eSewa. If money was deducted, it will be refunded within 3-5 business days.';
      case 'booking_not_found':
        return 'The booking reference was not found. Please try again.';
      case 'no_data':
      case 'invalid_data':
        return 'Invalid response received from eSewa. Please contact support.';
      default:
        return 'Something went wrong during the payment. Please try again.';
    }
  };

  return (
    <div>
      <nav>
        <div className="logo">
          <img src={logo} alt="Life Tours" style={{ height: '50px' }} />
        </div>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
        </ul>
      </nav>

      <div className="status-page">
        <div className="status-card failure">
          <div className="status-icon failure-icon">✕</div>
          <h1>Payment Failed</h1>
          <p className="status-message">{getReasonMessage(reason)}</p>

          <div className="status-actions">
            <button onClick={() => navigate(-1)} className="status-btn primary">
              Try Again
            </button>
            <button onClick={() => navigate('/home')} className="status-btn secondary">
              Back to Home
            </button>
          </div>

          <p className="status-note">
            Need help? Contact us at <strong>info@lifetoursandtravels.com</strong> or call <strong>+977-9810342647</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;