import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './FlightResults.css';

function FlightResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const passengers = searchParams.get('passengers') || '1 Adult';
  const tripType = searchParams.get('tripType') || 'oneway';
  const adults = parseInt(searchParams.get('adults')) || 1;
  const children = parseInt(searchParams.get('children')) || 0;
  const totalPassengers = adults + children;

  const isRoundTrip = tripType === 'roundtrip';

  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selection state
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [step, setStep] = useState('outbound'); // 'outbound' | 'return' | 'review'

  useEffect(() => {
    fetchFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const fetchFlights = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/flights/search', {
        params: { from, to, trip_type: tripType },
      });

      setOutboundFlights(response.data.outbound || response.data.flights || []);
      setReturnFlights(response.data.return_flights || []);

      setSelectedOutbound(null);
      setSelectedReturn(null);
      setStep('outbound');
    } catch (err) {
      console.error('Fetch flights error:', err);
      setError('Failed to load flights. Please try again.');
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
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const computeTotalFare = () => {
    const outFare = selectedOutbound ? Number(selectedOutbound.fare) : 0;
    const retFare = selectedReturn ? Number(selectedReturn.fare) : 0;
    return (outFare + retFare) * totalPassengers;
  };

  const proceedToBooking = () => {
    if (!selectedOutbound) return;
    if (isRoundTrip && !selectedReturn) return;

    const params = new URLSearchParams({
      adults: String(adults),
      children: String(children),
      tripType,
    });

    if (selectedReturn) {
      params.set('returnId', selectedReturn.id);
    }

    navigate(`/booking/${selectedOutbound.id}?${params.toString()}`);
  };

  const handleSelect = (flight, type) => {
    if (type === 'outbound') {
      setSelectedOutbound(flight);
      if (isRoundTrip) setStep('return');
    } else {
      setSelectedReturn(flight);
      setStep('review');
    }
  };

  const renderFlightCard = (flight, type) => {
    const isSelected =
      (type === 'outbound' && selectedOutbound?.id === flight.id) ||
      (type === 'return' && selectedReturn?.id === flight.id);

    return (
      <div
        className={`flight-card ${isSelected ? 'selected' : ''}`}
        key={flight.id}
        onClick={() => handleSelect(flight, type)}
        style={{ cursor: 'pointer' }}
      >
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
          <span className="seats-badge">{flight.seats_available} seats left</span>
        </div>

        <div className="flight-fare">
          <p className="fare-label">Starting from</p>
          <p className="fare-price">Rs. {Number(flight.fare).toLocaleString()}</p>

          <button
            type="button"
            className="view-details-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/flight/${flight.id}`);
            }}
          >
            View Details
          </button>

          {isRoundTrip && isSelected && (
            <div className="selected-indicator">✓ Selected</div>
          )}
        </div>
      </div>
    );
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
        {/* Summary */}
        <div className="search-summary">
          <div className="summary-route">
            <h2>
              {isRoundTrip ? `${from} ⇄ ${to}` : `${from} → ${to}`}
            </h2>
            <p>
              {formatDate(date)}
              {isRoundTrip && returnDate && ` — Return: ${formatDate(returnDate)}`}
              {` • ${passengers}`}
            </p>
          </div>
          <button className="modify-search-btn" onClick={() => navigate('/home')}>
            Modify Search
          </button>
        </div>

        {/* Progress (round trip only) */}
        {isRoundTrip && !loading && (
          <div className="rt-steps">
            <div className={`rt-step ${step === 'outbound' ? 'active' : ''} ${selectedOutbound ? 'done' : ''}`}>
              <span className="rt-num">1</span>
              <span>Outbound: {from} → {to}</span>
            </div>
            <div className="rt-arrow">→</div>
            <div className={`rt-step ${step === 'return' ? 'active' : ''} ${selectedReturn ? 'done' : ''}`}>
              <span className="rt-num">2</span>
              <span>Return: {to} → {from}</span>
            </div>
            <div className="rt-arrow">→</div>
            <div className={`rt-step ${step === 'review' ? 'active' : ''}`}>
              <span className="rt-num">3</span>
              <span>Review</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching for flights...</p>
          </div>
        )}

        {error && <div className="error-state">{error}</div>}

        {!loading && !error && (
          <>
            {(!isRoundTrip || step === 'outbound') && (
              <div className="flights-list">
                <div className="results-header">
                  <h3>
                    {isRoundTrip
                      ? `Outbound Flights (${from} → ${to})`
                      : `${outboundFlights.length} flights available`}
                  </h3>
                  <p>
                    {isRoundTrip
                      ? 'Click a card to select • Click View Details for full info'
                      : 'Sorted by departure time'}
                  </p>
                </div>
                {outboundFlights.length === 0 ? (
                  <div className="no-flights">
                    <h3>No flights found</h3>
                    <p>Sorry, no flights available for {from} → {to}.</p>
                    <button onClick={() => navigate('/home')}>Try Another Route</button>
                  </div>
                ) : (
                  outboundFlights.map((f) => renderFlightCard(f, 'outbound'))
                )}

                {isRoundTrip && selectedOutbound && (
                  <button className="rt-next-btn" onClick={() => setStep('return')}>
                    Continue to Return Flights →
                  </button>
                )}
              </div>
            )}

            {isRoundTrip && step === 'return' && (
              <div className="flights-list">
                <button className="rt-back-btn" onClick={() => setStep('outbound')}>
                  ← Change outbound flight
                </button>
                <div className="results-header">
                  <h3>Return Flights ({to} → {from})</h3>
                  <p>Click a card to select • Click View Details for full info</p>
                </div>
                {returnFlights.length === 0 ? (
                  <div className="no-flights">
                    <h3>No return flights found</h3>
                    <p>Sorry, no return flights available for {to} → {from}.</p>
                    <button onClick={() => navigate('/home')}>Try Another Route</button>
                  </div>
                ) : (
                  returnFlights.map((f) => renderFlightCard(f, 'return'))
                )}
              </div>
            )}

            {isRoundTrip && step === 'review' && selectedOutbound && selectedReturn && (
              <div className="rt-review">
                <h3 className="rt-review-title">Review Your Selection</h3>

                <div className="rt-review-card">
                  <div className="rt-tag">Outbound</div>
                  <div className="rt-card-body">
                    <div className="rt-city-pair">
                      <div>
                        <div className="rt-time">{formatTime(selectedOutbound.departure_time)}</div>
                        <div className="rt-city">{selectedOutbound.from_city}</div>
                      </div>
                      <div className="rt-arrow-mid">✈ →</div>
                      <div>
                        <div className="rt-time">{formatTime(selectedOutbound.arrival_time)}</div>
                        <div className="rt-city">{selectedOutbound.to_city}</div>
                      </div>
                    </div>
                    <div className="rt-meta">
                      {selectedOutbound.airline} • {selectedOutbound.flight_number}
                    </div>
                  </div>
                  <div className="rt-card-price">Rs. {Number(selectedOutbound.fare).toLocaleString()}</div>
                </div>

                <div className="rt-review-card">
                  <div className="rt-tag return">Return</div>
                  <div className="rt-card-body">
                    <div className="rt-city-pair">
                      <div>
                        <div className="rt-time">{formatTime(selectedReturn.departure_time)}</div>
                        <div className="rt-city">{selectedReturn.from_city}</div>
                      </div>
                      <div className="rt-arrow-mid">✈ →</div>
                      <div>
                        <div className="rt-time">{formatTime(selectedReturn.arrival_time)}</div>
                        <div className="rt-city">{selectedReturn.to_city}</div>
                      </div>
                    </div>
                    <div className="rt-meta">
                      {selectedReturn.airline} • {selectedReturn.flight_number}
                    </div>
                  </div>
                  <div className="rt-card-price">Rs. {Number(selectedReturn.fare).toLocaleString()}</div>
                </div>

                <div className="rt-total">
                  <span>Total for {totalPassengers} passenger{totalPassengers > 1 ? 's' : ''}:</span>
                  <strong>Rs. {computeTotalFare().toLocaleString()}</strong>
                </div>

                <div className="rt-review-actions">
                  <button className="rt-back-btn" onClick={() => setStep('return')}>
                    ← Change return
                  </button>
                  <button className="rt-proceed-btn" onClick={proceedToBooking}>
                    Proceed to Booking →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FlightResults;