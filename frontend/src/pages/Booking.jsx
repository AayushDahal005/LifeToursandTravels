import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import './Booking.css';

function Booking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Round-trip params from URL
  const returnId = searchParams.get('returnId');
  const tripType = searchParams.get('tripType') || 'oneway';
  const isRoundTrip = tripType === 'roundtrip' && returnId;

  // Passenger counts from URL
  const adultsCount = parseInt(searchParams.get('adults')) || 1;
  const childrenCount = parseInt(searchParams.get('children')) || 0;
  const totalPassengers = adultsCount + childrenCount;

  const [flight, setFlight] = useState(null);
  const [returnFlight, setReturnFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Passenger details array
  const [passengers, setPassengers] = useState(
    Array.from({ length: totalPassengers }, (_, i) => ({
      title: 'Mr.',
      fullName: '',
      dob: '',
      gender: 'Male',
      nationality: 'Nepali',
      passportNumber: '',
      type: i < adultsCount ? 'Adult' : 'Child',
    }))
  );

  // Contact details
  const [contact, setContact] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // VAT Bill option
  const [wantVatBill, setWantVatBill] = useState(false);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Error states
  const [formErrors, setFormErrors] = useState({});

  // Fetch flight(s) on mount or when id/returnId changes
  useEffect(() => {
    fetchFlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, returnId]);

  // Reset passenger forms if passenger counts change
  useEffect(() => {
    setPassengers(
      Array.from({ length: totalPassengers }, (_, i) => ({
        title: 'Mr.',
        fullName: '',
        dob: '',
        gender: 'Male',
        nationality: 'Nepali',
        passportNumber: '',
        type: i < adultsCount ? 'Adult' : 'Child',
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, adultsCount, childrenCount]);

  const fetchFlight = async () => {
    try {
      const response = await api.get(`/flights/${id}`);
      setFlight(response.data.flight);

      if (returnId) {
        const returnRes = await api.get(`/flights/${returnId}`);
        setReturnFlight(returnRes.data.flight);
      } else {
        setReturnFlight(null);
      }
    } catch (err) {
      console.error('Error fetching flight:', err);
      setError('Failed to load flight details');
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = (e) => {
    if (e.target.showPicker) {
      e.target.showPicker();
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);

    if (formErrors[`passenger_${index}_${field}`]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[`passenger_${index}_${field}`];
        return copy;
      });
    }
  };

  const handleContactChange = (field, value) => {
    setContact((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const applyPromoCode = () => {
    setPromoError('');
    setPromoSuccess('');

    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError('Please enter a promo code');
      return;
    }

    const promoCodes = {
      FLY10: 10,
      LIFE20: 20,
      NEWYEAR15: 15,
      WELCOME5: 5,
    };

    if (promoCodes[code]) {
      setPromoApplied(true);
      setPromoDiscount(promoCodes[code]);
      setPromoSuccess(`✓ Promo applied! ${promoCodes[code]}% discount`);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoError('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  const validateForm = () => {
    const errors = {};

    passengers.forEach((p, i) => {
      if (!p.fullName.trim()) {
        errors[`passenger_${i}_fullName`] = 'Full name is required';
      }
      if (!p.dob) {
        errors[`passenger_${i}_dob`] = 'Date of birth is required';
      }
      if (!p.nationality.trim()) {
        errors[`passenger_${i}_nationality`] = 'Nationality is required';
      }
      if (!p.passportNumber.trim()) {
        errors[`passenger_${i}_passportNumber`] = 'Passport/ID number is required';
      }
    });

    if (!contact.name.trim()) {
      errors.contactName = 'Contact name is required';
    }
    if (!contact.phone.trim()) {
      errors.contactPhone = 'Contact number is required';
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(contact.phone)) {
      errors.contactPhone = 'Invalid phone number';
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      errors.contactEmail = 'Invalid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateFare = () => {
    if (!flight) return { subtotal: 0, discount: 0, vat: 0, total: 0, baseFare: 0 };

    const outboundFare = Number(flight.fare);
    const returnFare = returnFlight ? Number(returnFlight.fare) : 0;
    const farePerPassenger = outboundFare + returnFare;

    const subtotal = farePerPassenger * totalPassengers;
    const discountAmount = (subtotal * promoDiscount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const vat = wantVatBill ? afterDiscount * 0.13 : 0;
    const total = afterDiscount + vat;

    return {
      subtotal,
      discount: discountAmount,
      vat,
      total,
      baseFare: farePerPassenger,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fill in all required fields');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const fareData = calculateFare();

      const bookingData = {
        flight_id: flight.id,
        return_flight_id: returnId || null,
        is_round_trip: isRoundTrip ? true : false,
        passengers: passengers,
        contact: contact,
        base_fare: fareData.subtotal,
        discount: fareData.discount,
        vat: fareData.vat,
        total_amount: fareData.total,
        promo_code: promoApplied ? promoCode : null,
        want_vat_bill: wantVatBill,
      };

      console.log('Initiating Khalti payment with:', bookingData);

      const response = await api.post('/payment/initiate', bookingData);

      if (!response.data.success || !response.data.payment_url) {
        throw new Error(response.data.message || 'Payment initiation failed');
      }

      console.log('Redirecting to Khalti:', response.data.payment_url);
      window.location.href = response.data.payment_url;
    } catch (err) {
      console.error('Payment error:', err);
      console.error('Response:', err.response?.data);
      alert(
        'Booking failed: ' +
        (err.response?.data?.message || err.message || 'Please try again.')
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="booking-error">
        <h2>{error || 'Flight not found'}</h2>
        <button onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    );
  }

  const fare = calculateFare();

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
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button onClick={() => navigate('/login')} className="nav-btn" style={{ background: '#dc3545' }}>
          Logout
        </button>
      </nav>

      <div className="booking-page">
        {/* Page Title */}
        <div className="booking-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Flight
          </button>
          <h1>Complete Your Booking</h1>
          <p>
            Fill in passenger details to confirm your flight
            {isRoundTrip && ' (Round Trip)'}
          </p>
        </div>

        {/* Outbound Flight Summary Card */}
        <div className="flight-summary">
          <div className="summary-airline">
            <div className="summary-icon">✈️</div>
            <div>
              <h3>{flight.airline}</h3>
              <p>
                {isRoundTrip && 'Outbound • '}
                {flight.flight_number} • {flight.aircraft}
              </p>
            </div>
          </div>
          <div className="summary-route">
            <div className="route-point">
              <span className="route-time">{formatTime(flight.departure_time)}</span>
              <span className="route-city">{flight.from_city}</span>
            </div>
            <div className="route-arrow">→</div>
            <div className="route-point">
              <span className="route-time">{formatTime(flight.arrival_time)}</span>
              <span className="route-city">{flight.to_city}</span>
            </div>
          </div>
        </div>

        {/* Return Flight Summary Card (round trips only) */}
        {isRoundTrip && returnFlight && (
          <div
            className="flight-summary return-summary"
            style={{
              marginTop: '15px',
              background: 'linear-gradient(135deg, #2E86AB 0%, #12263A 100%)',
            }}
          >
            <div className="summary-airline">
              <div className="summary-icon">🔄</div>
              <div>
                <h3>{returnFlight.airline}</h3>
                <p>Return • {returnFlight.flight_number} • {returnFlight.aircraft}</p>
              </div>
            </div>
            <div className="summary-route">
              <div className="route-point">
                <span className="route-time">{formatTime(returnFlight.departure_time)}</span>
                <span className="route-city">{returnFlight.from_city}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-point">
                <span className="route-time">{formatTime(returnFlight.arrival_time)}</span>
                <span className="route-city">{returnFlight.to_city}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ===== PASSENGER DETAILS ===== */}
          <div className="section-card">
            <div className="section-header">
              <h2>Passenger Details</h2>
              <span className="section-badge">
                {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}
              </span>
            </div>

            {passengers.map((passenger, index) => (
              <div key={index} className="passenger-form">
                <div className="passenger-header">
                  <div className="passenger-number">
                    <span className="pax-num">{index + 1}</span>
                    <div>
                      <h4>{passenger.type} Passenger</h4>
                      <p>{passenger.type === 'Adult' ? 'Age 12+' : 'Age 2-11'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  {/* Title */}
                  <div className="form-group">
                    <label>Title <span className="required">*</span></label>
                    <select
                      value={passenger.title}
                      onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>

                  {/* Full Name */}
                  <div className="form-group form-group-wide">
                    <label>Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="As per passport/ID"
                      value={passenger.fullName}
                      onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                      className={formErrors[`passenger_${index}_fullName`] ? 'error' : ''}
                    />
                    {formErrors[`passenger_${index}_fullName`] && (
                      <span className="field-error">{formErrors[`passenger_${index}_fullName`]}</span>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="form-group">
                    <label>Date of Birth <span className="required">*</span></label>
                    <input
                      type="date"
                      value={passenger.dob}
                      onChange={(e) => handlePassengerChange(index, 'dob', e.target.value)}
                      onClick={openDatePicker}
                      onFocus={openDatePicker}
                      max={getTodayDate()}
                      className={formErrors[`passenger_${index}_dob`] ? 'error' : ''}
                      style={{ cursor: 'pointer' }}
                    />
                    {formErrors[`passenger_${index}_dob`] && (
                      <span className="field-error">{formErrors[`passenger_${index}_dob`]}</span>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Nationality */}
                  <div className="form-group">
                    <label>Nationality <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="Nepali"
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                      className={formErrors[`passenger_${index}_nationality`] ? 'error' : ''}
                    />
                    {formErrors[`passenger_${index}_nationality`] && (
                      <span className="field-error">{formErrors[`passenger_${index}_nationality`]}</span>
                    )}
                  </div>

                  {/* Passport/ID */}
                  <div className="form-group">
                    <label>Passport / Citizenship No. <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="Passport or Citizenship number"
                      value={passenger.passportNumber}
                      onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                      className={formErrors[`passenger_${index}_passportNumber`] ? 'error' : ''}
                    />
                    {formErrors[`passenger_${index}_passportNumber`] && (
                      <span className="field-error">{formErrors[`passenger_${index}_passportNumber`]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== CONTACT DETAILS ===== */}
          <div className="section-card">
            <div className="section-header">
              <h2>Contact Details</h2>
              <span className="section-badge">Booking confirmation will be sent here</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Contact Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={contact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className={formErrors.contactName ? 'error' : ''}
                />
                {formErrors.contactName && (
                  <span className="field-error">{formErrors.contactName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Contact Number <span className="required">*</span></label>
                <input
                  type="tel"
                  placeholder="+977-98XXXXXXXX"
                  value={contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className={formErrors.contactPhone ? 'error' : ''}
                />
                {formErrors.contactPhone && (
                  <span className="field-error">{formErrors.contactPhone}</span>
                )}
              </div>

              <div className="form-group form-group-wide">
                <label>Email Address <span className="optional">(Optional)</span></label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className={formErrors.contactEmail ? 'error' : ''}
                />
                {formErrors.contactEmail && (
                  <span className="field-error">{formErrors.contactEmail}</span>
                )}
              </div>
            </div>
          </div>

          {/* ===== VAT BILL ===== */}
          <div className="section-card">
            <div className="vat-option">
              <label className="vat-label">
                <input
                  type="checkbox"
                  checked={wantVatBill}
                  onChange={(e) => setWantVatBill(e.target.checked)}
                />
                <div className="vat-text">
                  <strong>I want a VAT Bill</strong>
                  <span>13% VAT will be added to your total</span>
                </div>
              </label>
            </div>
          </div>

          {/* ===== PROMO CODE ===== */}
          <div className="section-card">
            <div className="section-header">
              <h2>Promo Code</h2>
              <span className="section-badge">Optional</span>
            </div>

            <div className="promo-section">
              <div className="promo-input-row">
                <input
                  type="text"
                  placeholder="Enter promo code (Try: FLY10, LIFE20, NEWYEAR15)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={promoApplied}
                />
                {!promoApplied ? (
                  <button type="button" onClick={applyPromoCode} className="promo-apply-btn">
                    Apply
                  </button>
                ) : (
                  <button type="button" onClick={removePromoCode} className="promo-remove-btn">
                    Remove
                  </button>
                )}
              </div>
              {promoError && <p className="promo-error">✗ {promoError}</p>}
              {promoSuccess && <p className="promo-success">{promoSuccess}</p>}
            </div>
          </div>

          {/* ===== FARE SUMMARY ===== */}
          <div className="fare-summary-card">
            <h2>Fare Summary</h2>

            <div className="fare-row">
              <span>
                Base Fare ({totalPassengers} × Rs. {fare.baseFare.toLocaleString()})
                {isRoundTrip && ' — incl. return'}
              </span>
              <span>Rs. {fare.subtotal.toLocaleString()}</span>
            </div>

            {promoApplied && (
              <div className="fare-row discount">
                <span>Promo Discount ({promoDiscount}%)</span>
                <span>- Rs. {fare.discount.toLocaleString()}</span>
              </div>
            )}

            {wantVatBill && (
              <div className="fare-row">
                <span>VAT (13%)</span>
                <span>Rs. {fare.vat.toLocaleString()}</span>
              </div>
            )}

            <div className="fare-row total">
              <span>Total Amount</span>
              <span>Rs. {fare.total.toLocaleString()}</span>
            </div>

            <div className="booking-note">
              <p>💡 By clicking "Confirm Booking", you agree to our Terms & Conditions and Refund Policy.</p>
            </div>

            <button type="submit" className="confirm-booking-btn" disabled={submitting}>
              {submitting ? 'Redirecting to Khalti...' : `Confirm Booking - Rs. ${fare.total.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;