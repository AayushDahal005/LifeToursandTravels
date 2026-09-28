import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './FlightResults.css';

function FlightResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1 Adult';
  const tripType = searchParams.get('tripType') || 'oneway';
  const returnDate = searchParams.get('returnDate') || '';
  const adults = parseInt(searchParams.get('adults')) || 1;
  const children = parseInt(searchParams.get('children')) || 0;

  useEffect(() => {
    fetchFlights();
  }, [from, to]);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching flights with:', { from, to });

      const response = await api.get('/flights/search', {
        params: { from, to }
      });

      console.log('API Response:', response.data);

      setFlights(response.data.flights || []);
    } catch (err) {
      console.error('FULL ERROR:', err);
      console.error('Response:', err.response?.data);

      if (err.response?.status === 404) {
        setError('Flights API not found.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Is Laravel running?');
      } else {
        setError('Failed to load flights. ' + (err.response?.data?.message || err.message));
      }
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
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

      <div className="results-page">
        {/* Search Summary */}
        <div className="search-summary">
          <div className="summary-route">
            <h2>{from} → {to}</h2>
            <p>
              {formatDate(date)}
              {tripType === 'roundtrip' && returnDate && ` • Return: ${formatDate(returnDate)}`}
              {` • ${passengers}`}
            </p>
          </div>
         <button
  className="modify-search-btn"
  onClick={() => navigate(`/home?from=${from}&to=${to}&date=${date}&passengers=${encodeURIComponent(passengers)}&adults=${adults}&children=${children}&tripType=${tripType}${returnDate ? `&returnDate=${returnDate}` : ''}`)}
>
  Modify Search
</button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching for flights...</p>
          </div>
        )}

        {error && <div className="error-state">{error}</div>}

        {!loading && !error && flights.length === 0 && (
          <div className="no-flights">
            <h3>No flights found</h3>
            <p>Sorry, there are no flights available for {from} → {to}.</p>
            <button onClick={() => navigate('/home')}>Try Another Route</button>
          </div>
        )}

        {!loading && flights.length > 0 && (
          <div className="flights-list">
            <div className="results-header">
              <h3>{flights.length} flights available</h3>
              <p>Sorted by departure time</p>
            </div>

            {flights.map((flight) => (
              <div className="flight-card" key={flight.id}>
                <div className="flight-airline">
                  <div className="airline-logo">✈️</div>
                  <div>
                    <h4>{flight.airline}</h4>
                    <p>{flight.flight_number}</p>
                  </div>
                </div>

                <div className="flight-times">
                  <div className="time-block">
                    <span className="time">{formatTime(flight.departure_time)}</span>
                    <span className="city">{flight.from_city}</span>
                  </div>
                  <div className="flight-duration">
                    <div className="duration-line"></div>
                    <span className="duration-text">{flight.duration}</span>
                  </div>
                  <div className="time-block">
                    <span className="time">{formatTime(flight.arrival_time)}</span>
                    <span className="city">{flight.to_city}</span>
                  </div>
                </div>

                <div className="flight-info">
                  <span className={`refundable-badge ${flight.refundable ? 'yes' : 'no'}`}>
                    {flight.refundable ? '✓ Refundable' : '✗ Non-refundable'}
                  </span>
                  <span className="seats-badge">
                    {flight.seats_available} seats left
                  </span>
                </div>

                <div className="flight-fare">
  <p className="fare-label">
    {adults + children > 1 ? `Total for ${adults + children} passengers` : 'Starting from'}
  </p>
  <p className="fare-price">
    Rs. {(Number(flight.fare) * (adults + children)).toLocaleString()}
  </p>
  {adults + children > 1 && (
    <p style={{
      fontSize: '11px',
      color: '#5A6B7A',
      marginTop: '-6px',
      marginBottom: '8px'
    }}>
      {adults} Adult{adults > 1 ? 's' : ''}
      {children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}
      {' × Rs. '}{Number(flight.fare).toLocaleString()}
    </p>
  )}
  <button
    className="view-details-btn"
    onClick={() => navigate(`/flight/${flight.id}?adults=${adults}&children=${children}`)}
  >
    View Details
  </button>
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FlightResults;