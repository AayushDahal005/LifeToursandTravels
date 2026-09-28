import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './FlightDetails.css';

function FlightDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read passenger counts from URL
  const adults = parseInt(searchParams.get('adults')) || 1;
  const children = parseInt(searchParams.get('children')) || 0;
  const totalPassengers = adults + children;

  useEffect(() => {
    fetchFlightDetails();
  }, [id]);

  const fetchFlightDetails = async () => {
    try {
      if (!id || id === 'undefined') {
        setError('Flight ID missing');
        setLoading(false);
        return;
      }
      const response = await api.get(`/flights/${id}`);
      setFlight(response.data.flight);
    } catch (err) {
      console.error('Error fetching flight details:', err);
      setError('Failed to load flight details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading flight details...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div>
       <Link to="/home" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
  <img
    src={logo}
    alt="Life Tours and Travels"
    style={{ height: '50px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
  />
</Link>
        <div className="error-container">
          <h2>{error || 'Flight not found'}</h2>
          <button onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const totalFare = Number(flight.fare) * totalPassengers;

  return (
    <div>
      <nav>
        <div className="logo">
          <img
            src={logo}
            alt="Life Tours and Travels"
            style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px', color: '#fff' }}>
            Welcome, {JSON.parse(localStorage.getItem('user'))?.name || 'User'}
          </span>
          <button onClick={handleLogout} className="nav-btn" style={{ background: '#dc3545' }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="details-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Results
        </button>

        <div className="flight-header-card">
          <div className="header-airline">
            <div className="airline-logo-large">✈️</div>
            <div>
              <h2>{flight.airline}</h2>
              <p>{flight.flight_number} • {flight.aircraft}</p>
            </div>
          </div>
          <div className={`refundable-large ${flight.refundable ? 'yes' : 'no'}`}>
            {flight.refundable ? '✓ Fully Refundable' : '✗ Non-refundable'}
          </div>
        </div>

        <div className="route-card">
          <div className="route-timeline">
            <div className="route-point">
              <div className="point-marker"></div>
              <div className="point-info">
                <span className="point-time">{formatTime(flight.departure_time)}</span>
                <span className="point-city">{flight.from_city}</span>
                <span className="point-label">Departure</span>
              </div>
            </div>

            <div className="route-line">
              <div className="line-icon">✈️</div>
              <span className="line-duration">{flight.duration}</span>
            </div>

            <div className="route-point">
              <div className="point-marker end"></div>
              <div className="point-info">
                <span className="point-time">{formatTime(flight.arrival_time)}</span>
                <span className="point-city">{flight.to_city}</span>
                <span className="point-label">Arrival</span>
              </div>
            </div>
          </div>
        </div>

        <div className="details-grid">
          <div className="details-section">
            <h3>Flight Information</h3>
            <div className="info-row">
              <span className="info-label">Airline</span>
              <span className="info-value">{flight.airline}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Flight Number</span>
              <span className="info-value">{flight.flight_number}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Aircraft</span>
              <span className="info-value">{flight.aircraft}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Duration</span>
              <span className="info-value">{flight.duration}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Refund Policy</span>
              <span className={`info-value ${flight.refundable ? 'green' : 'red'}`}>
                {flight.refundable ? 'Refundable' : 'Non-refundable'}
              </span>
            </div>
          </div>

          <div className="details-section">
            <h3>Baggage Allowance</h3>
            <div className="baggage-info">
              <div className="baggage-icon">🧳</div>
              <div>
                <p className="baggage-title">Checked Baggage</p>
                <p className="baggage-value">{flight.baggage}</p>
              </div>
            </div>
            <div className="info-row">
              <span className="info-label">Seats Available</span>
              <span className="info-value highlight">{flight.seats_available} seats</span>
            </div>
          </div>
        </div>

        {/* Fare Summary */}
        <div className="fare-summary-card">
          <div className="fare-breakdown">
            <h3>Fare Summary</h3>
            <div className="fare-row">
              <span>Base Fare (per person)</span>
              <span>Rs. {Number(flight.fare).toLocaleString()}</span>
            </div>
            <div className="fare-row">
              <span>
                Passengers
              </span>
              <span>
                {adults} Adult{adults > 1 ? 's' : ''}
                {children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
              </span>
            </div>
            <div className="fare-row">
              <span>Taxes &amp; Fees</span>
              <span>Included</span>
            </div>
            <div className="fare-row total">
              <span>Total ({totalPassengers} × Rs. {Number(flight.fare).toLocaleString()})</span>
              <span>Rs. {totalFare.toLocaleString()}</span>
            </div>
          </div>
          <button
            className="book-now-btn"
            onClick={() => navigate(`/booking/${flight.id}?adults=${adults}&children=${children}`)}
          >
            Book This Flight
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlightDetails;