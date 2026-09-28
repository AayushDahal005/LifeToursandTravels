import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Home.css';

import pokharaImg from '../assets/pokhara.jpg';
import delhiImg from '../assets/delhi.jpg';
import dubaiImg from '../assets/dubai.jpg';
import bangkokImg from '../assets/bangkok.jpg';
import api from '../services/api';

// Helper: Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Open date picker on click
const openDatePicker = (e) => {
  if (e.target.showPicker) {
    e.target.showPicker();
  }
};

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem('user'));

  const [tripType, setTripType] = useState(searchParams.get('tripType') || 'oneway');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  const [departureDate, setDepartureDate] = useState(searchParams.get('date') || '');
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') || '');
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults')) || 1);
  const [children, setChildren] = useState(parseInt(searchParams.get('children')) || 0);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  // Profile modal state
  const [showProfile, setShowProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // List of cities
  const cities = [
    'Kathmandu',
    'Pokhara',
    'Biratnagar',
    'Bharatpur',
    'Nepalgunj',
    'Dhangadhi',
    'Bhairahawa',
    'Janakpur',
    'Simara',
    'Tumlingtar',
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  // Open profile modal and fetch fresh user data
  const openProfile = async () => {
    setShowProfile(true);
    setProfileLoading(true);
    try {
      const response = await api.get('/user');
      setProfileData(response.data.user);
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Fall back to localStorage data
      setProfileData(user);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleTripTypeChange = (e) => {
    const value = e.target.value;
    setTripType(value);
    if (value === 'oneway') {
      setReturnDate('');
    }
  };

  // Passenger counter handlers
  const incrementAdults = () => { if (adults < 9) setAdults(adults + 1); };
  const decrementAdults = () => { if (adults > 1) setAdults(adults - 1); };
  const incrementChildren = () => { if (children < 9) setChildren(children + 1); };
  const decrementChildren = () => { if (children > 0) setChildren(children - 1); };

  const getPassengerSummary = () => {
    const parts = [`${adults} Adult${adults > 1 ? 's' : ''}`];
    if (children > 0) {
      parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    }
    return parts.join(', ');
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (from === to) {
      alert('From and To cities cannot be the same!');
      return;
    }

    const passengerQuery = getPassengerSummary();
    navigate(`/flights?from=${from}&to=${to}&date=${departureDate}&passengers=${encodeURIComponent(passengerQuery)}&adults=${adults}&children=${children}&tripType=${tripType}${returnDate ? `&returnDate=${returnDate}` : ''}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      {/* NAVBAR */}
      <nav>
        <Link to="/home" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Life Tours and Travels"
            style={{
              height: '50px',
              width: 'auto',
              marginRight: '12px',
              verticalAlign: 'middle',
              objectFit: 'contain',
              cursor: 'pointer'
            }}
          />
        </Link>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#flights">Flights</a></li>
          <li><a href="#destinations">Destinations</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Profile button (replaces "Welcome, User" text) */}
          <button
            onClick={openProfile}
            className="profile-btn"
            title="View my profile"
          >
            <span className="profile-avatar">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="profile-name">{user.name || 'User'}</span>
          </button>
          <button onClick={handleLogout} className="nav-btn" style={{ background: '#dc3545' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero" id="home">
        <h1>Fly Anywhere, Anytime</h1>
        <p>Book domestic and international flights with Life Tours and Travels Pvt Ltd.</p>
      </div>

      {/* SEARCH BOX */}
      <form onSubmit={handleSearch} className="search-box" id="flights">
        {/* FROM City Dropdown */}
        <div className="field">
          <label>FROM</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #D9E2E8',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select City</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* TO City Dropdown */}
        <div className="field">
          <label>TO</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid #D9E2E8',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select City</option>
            {cities.map((city, index) => (
              <option
                key={index}
                value={city}
                disabled={city === from}
              >
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Trip Type */}
        <div className="field" style={{ minWidth: '130px' }}>
          <label>TRIP TYPE</label>
          <select
            value={tripType}
            onChange={handleTripTypeChange}
          >
            <option value="oneway">✈️ One Way</option>
            <option value="roundtrip">🔄 Round Trip</option>
          </select>
        </div>

        {/* Departure Date */}
        <div className="field">
          <label>DEPARTURE</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            onClick={openDatePicker}
            onFocus={openDatePicker}
            min={getTodayDate()}
            required
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Return Date */}
        {tripType === 'roundtrip' && (
          <div className="field return-date">
            <label style={{ color: '#F2A541', fontWeight: '700' }}>RETURN</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              onClick={openDatePicker}
              onFocus={openDatePicker}
              min={departureDate || getTodayDate()}
              required
              style={{ cursor: 'pointer', borderColor: '#F2A541' }}
            />
          </div>
        )}

        {/* Passengers - Custom +/− Counter */}
        <div className="field" style={{ position: 'relative', minWidth: '180px' }}>
          <label>PASSENGERS</label>
          <button
            type="button"
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            style={{
              padding: '10px 12px',
              border: '1px solid #D9E2E8',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <span>{getPassengerSummary()}</span>
            <span style={{ fontSize: '10px', color: '#5A6B7A' }}>▼</span>
          </button>

          {showPassengerDropdown && (
            <>
              <div
                onClick={() => setShowPassengerDropdown(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  padding: '15px',
                  zIndex: 1000,
                  marginTop: '5px',
                  minWidth: '240px'
                }}
              >
                {/* Adults Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  paddingBottom: '15px',
                  borderBottom: '1px solid #EAF4FA'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#12263A', fontSize: '14px' }}>Adults</div>
                    <div style={{ fontSize: '12px', color: '#5A6B7A' }}>Age 12+</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={decrementAdults}
                      disabled={adults <= 1}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid ' + (adults <= 1 ? '#E5E7EB' : '#2E86AB'),
                        background: 'white',
                        color: adults <= 1 ? '#ccc' : '#2E86AB',
                        cursor: adults <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', color: '#12263A' }}>
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={incrementAdults}
                      disabled={adults >= 9}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid ' + (adults >= 9 ? '#E5E7EB' : '#2E86AB'),
                        background: 'white',
                        color: adults >= 9 ? '#ccc' : '#2E86AB',
                        cursor: adults >= 9 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#12263A', fontSize: '14px' }}>Children</div>
                    <div style={{ fontSize: '12px', color: '#5A6B7A' }}>Age 2-11</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={decrementChildren}
                      disabled={children <= 0}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid ' + (children <= 0 ? '#E5E7EB' : '#2E86AB'),
                        background: 'white',
                        color: children <= 0 ? '#ccc' : '#2E86AB',
                        cursor: children <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', color: '#12263A' }}>
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={incrementChildren}
                      disabled={children >= 9}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid ' + (children >= 9 ? '#E5E7EB' : '#2E86AB'),
                        background: 'white',
                        color: children >= 9 ? '#ccc' : '#2E86AB',
                        cursor: children >= 9 ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Done Button */}
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(false)}
                  style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '8px',
                    background: '#F2A541',
                    color: '#12263A',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search Button */}
        <button type="submit" className="search-btn" style={{
          background: tripType === 'roundtrip' ? '#12263A' : '#2E86AB'
        }}>
          {tripType === 'roundtrip' ? 'Search Round Trip' : 'Search Flights'}
        </button>
      </form>

      {/* Helper Text */}
      <div className="helper-text">
        {tripType === 'roundtrip' ? (
          <span>🔄 Round trip selected • Return date required</span>
        ) : (
          <span>✈️ One way trip selected</span>
        )}
      </div>

      {/* DESTINATIONS */}
      <section id="destinations">
        <h2 className="section-title">Popular Destinations</h2>
        <p className="section-sub">Handpicked routes our travellers love</p>
        <div className="destinations">
          <div className="dest-card">
            <img
              src={pokharaImg}
              alt="Pokhara"
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px 8px 0 0',
                marginBottom: '10px'
              }}
            />
            <h3>Pokhara</h3>
            <p>Starting from Rs. 9,500</p>
          </div>
          <div className="dest-card">
            <img
              src={delhiImg}
              alt="Delhi"
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px 8px 0 0',
                marginBottom: '10px'
              }}
            />
            <h3>Delhi</h3>
            <p>Starting from Rs. 12,000</p>
          </div>
          <div className="dest-card">
            <img
              src={dubaiImg}
              alt="Dubai"
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px 8px 0 0',
                marginBottom: '10px'
              }}
            />
            <h3>Dubai</h3>
            <p>Starting from Rs. 35,000</p>
          </div>
          <div className="dest-card">
            <img
              src={bangkokImg}
              alt="Bangkok"
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px 8px 0 0',
                marginBottom: '10px'
              }}
            />
            <h3>Bangkok</h3>
            <p>Starting from Rs. 28,000</p>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="features" id="about">
        <div>
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-sub">Simple, reliable, and made for travellers</p>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature">
              <div className="icon">✈️</div>
              <h4>Wide Network</h4>
              <p>Flights to major domestic and international destinations.</p>
            </div>
            <div className="feature">
              <div className="icon">💳</div>
              <h4>Secure Payment</h4>
              <p>Safe and simple checkout for every booking.</p>
            </div>
            <div className="feature">
              <div className="icon">🎧</div>
              <h4>24/7 Support</h4>
              <p>We're here to help before and after you fly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="foot-logo">
          <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img src={logo} alt="Life Tours and Travels" style={{ height: '40px', width: 'auto', marginBottom: '10px', objectFit: 'contain', cursor: 'pointer' }} />
          </Link>
          <br />
          Life Tours <span>&amp;</span> Travels Pvt Ltd.
        </div>
        <p>Kathmandu, Nepal &nbsp;|&nbsp; info@lifetoursandtravels.com &nbsp;|&nbsp; +977-9810342647</p>
        <p style={{ marginTop: '8px' }}>© 2026 Life Tours and Travels Pvt Ltd. All rights reserved.</p>
      </footer>

      {/* ===== PROFILE MODAL ===== */}
      {showProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>My Profile</h2>
              <button className="profile-modal-close" onClick={() => setShowProfile(false)}>✕</button>
            </div>

            <div className="profile-modal-body">
              {profileLoading ? (
                <div className="profile-loading">Loading profile…</div>
              ) : profileData ? (
                <>
                  {/* Avatar + Name */}
                  <div className="profile-hero">
                    <div className="profile-hero-avatar">
                      {(profileData.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-hero-info">
                      <h3>{profileData.name}</h3>
                      <p>{profileData.email}</p>
                      <span className={`profile-role-badge ${profileData.role}`}>
                        {profileData.role === 'admin' ? '🛡️ Administrator' : '👤 Customer'}
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="profile-details">
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Full Name</span>
                      <span className="profile-detail-value">{profileData.name || '—'}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Email Address</span>
                      <span className="profile-detail-value">{profileData.email || '—'}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Phone Number</span>
                      <span className="profile-detail-value">{profileData.phone || 'Not provided'}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Address</span>
                      <span className="profile-detail-value">{profileData.address || 'Not provided'}</span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Account Type</span>
                      <span className="profile-detail-value" style={{ textTransform: 'capitalize' }}>
                        {profileData.role || 'user'}
                      </span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="profile-detail-label">Member Since</span>
                      <span className="profile-detail-value">
                        {profileData.created_at
                          ? new Date(profileData.created_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>

                 
                  {/* Actions */}
{/* Actions */}
<div className="profile-modal-actions">
  <button
    className="profile-action-btn bookings"
    onClick={() => {
      setShowProfile(false);
      navigate('/my-bookings');
    }}
  >
    🎫 My Bookings
  </button>
  <button
    className="profile-action-btn logout"
    onClick={handleLogout}
  >
    🚪 Logout
  </button>
</div>
                </>
              ) : (
                <div className="profile-loading">Could not load profile.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;