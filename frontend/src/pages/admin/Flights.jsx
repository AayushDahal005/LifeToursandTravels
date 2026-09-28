import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const EMPTY_FLIGHT = {
  airline: '',
  flight_number: '',
  from_city: 'Kathmandu',
  to_city: '',
  departure_time: '',
  arrival_time: '',
  duration: '',
  fare: '',
  refundable: false,
  aircraft: '',
  baggage: '',
  seats_available: 50,
};

const CITIES = [
  'Kathmandu', 'Pokhara', 'Biratnagar', 'Bharatpur',
  'Nepalgunj', 'Dhangadhi', 'Bhairahawa', 'Janakpur',
  'Simara', 'Tumlingtar',
];

function Flights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FLIGHT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/flights');
      setFlights(response.data.flights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FLIGHT);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (flight) => {
    setEditingId(flight.id);
    setForm({
      ...flight,
      fare: flight.fare,
      refundable: !!flight.refundable,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editingId) {
        await api.put(`/admin/flights/${editingId}`, form);
      } else {
        await api.post('/admin/flights', form);
      }
      setShowModal(false);
      fetchFlights();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setFormError(Object.values(errors).flat().join(' • '));
      } else {
        setFormError(err.response?.data?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, flightNumber) => {
    if (!window.confirm(`Delete flight ${flightNumber}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/flights/${id}`);
      fetchFlights();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredFlights = flights.filter((f) => {
    const s = search.toLowerCase();
    return (
      f.airline.toLowerCase().includes(s) ||
      f.flight_number.toLowerCase().includes(s) ||
      f.from_city.toLowerCase().includes(s) ||
      f.to_city.toLowerCase().includes(s)
    );
  });

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Manage Flights</h1>
          <p>{flights.length} flights total</p>
        </div>
        <button className="admin-btn primary" onClick={openAddModal}>
          + Add Flight
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <input
            type="text"
            className="admin-search"
            placeholder="Search by airline, flight number, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="admin-loading">Loading flights…</div>
        ) : filteredFlights.length === 0 ? (
          <div className="empty-state">No flights found</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Airline / Flight</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Duration</th>
                  <th>Fare</th>
                  <th>Seats</th>
                  <th>Refund</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredFlights.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="cell-strong">{f.airline}</div>
                      <div className="cell-muted">{f.flight_number}</div>
                    </td>
                    <td>
                      <div className="cell-strong">{f.from_city} → {f.to_city}</div>
                      <div className="cell-muted">{f.aircraft}</div>
                    </td>
                    <td>{formatTime(f.departure_time)}</td>
                    <td>{formatTime(f.arrival_time)}</td>
                    <td>{f.duration}</td>
                    <td className="cell-strong">Rs. {Number(f.fare).toLocaleString()}</td>
                    <td>
                      <span className={`pill ${f.seats_available > 10 ? 'ok' : f.seats_available > 0 ? 'warn' : 'danger'}`}>
                        {f.seats_available}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${f.refundable ? 'ok' : 'muted'}`}>
                        {f.refundable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEditModal(f)}>✏️</button>
                      <button className="icon-btn" title="Delete" onClick={() => handleDelete(f.id, f.flight_number)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Flight' : 'Add New Flight'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {formError && <div className="form-error-banner">{formError}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label>Airline *</label>
                  <input name="airline" value={form.airline} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Flight Number *</label>
                  <input name="flight_number" value={form.flight_number} onChange={handleFormChange} required placeholder="U4 101" />
                </div>

                <div className="form-group">
                  <label>From *</label>
                  <select name="from_city" value={form.from_city} onChange={handleFormChange} required>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>To *</label>
                  <select name="to_city" value={form.to_city} onChange={handleFormChange} required>
                    <option value="">Select city</option>
                    {CITIES.filter((c) => c !== form.from_city).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Departure Time *</label>
                  <input type="time" name="departure_time" value={form.departure_time} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Arrival Time *</label>
                  <input type="time" name="arrival_time" value={form.arrival_time} onChange={handleFormChange} required />
                </div>

                <div className="form-group">
                  <label>Duration *</label>
                  <input name="duration" value={form.duration} onChange={handleFormChange} required placeholder="25 min" />
                </div>
                <div className="form-group">
                  <label>Fare (Rs.) *</label>
                  <input type="number" name="fare" value={form.fare} onChange={handleFormChange} required min="0" step="0.01" />
                </div>

                <div className="form-group">
                  <label>Seats Available *</label>
                  <input type="number" name="seats_available" value={form.seats_available} onChange={handleFormChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Aircraft</label>
                  <input name="aircraft" value={form.aircraft || ''} onChange={handleFormChange} placeholder="ATR 72-500" />
                </div>

                <div className="form-group form-wide">
                  <label>Baggage</label>
                  <input name="baggage" value={form.baggage || ''} onChange={handleFormChange} placeholder="20 kg checked + 5 kg hand" />
                </div>

                <div className="form-group form-wide checkbox-group">
                  <label>
                    <input type="checkbox" name="refundable" checked={!!form.refundable} onChange={handleFormChange} />
                    <span>Refundable</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Saving…' : (editingId ? 'Update Flight' : 'Create Flight')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flights;