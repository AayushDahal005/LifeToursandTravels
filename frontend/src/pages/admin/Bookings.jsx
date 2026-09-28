import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [working, setWorking] = useState(false);

  // EDIT MODE
  const [editMode, setEditMode] = useState(false);
  const [editPassengers, setEditPassengers] = useState([]);
  const [editContact, setEditContact] = useState({ name: '', phone: '', email: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;

      const response = await api.get('/admin/bookings', { params });

      const data = response.data.bookings;
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      setBookings(list);
    } catch (err) {
      console.error('Admin bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const confirmBooking = async (id) => {
    if (!window.confirm('Confirm this booking as PAID?')) return;
    setWorking(true);
    try {
      await api.post(`/admin/bookings/${id}/confirm`);
      fetchBookings();
      if (selected?.id === id) setSelected({ ...selected, payment_status: 'paid' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setWorking(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setWorking(true);
    try {
      await api.post(`/admin/bookings/${id}/cancel`);
      fetchBookings();
      if (selected?.id === id) setSelected({ ...selected, payment_status: 'cancelled' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setWorking(false);
    }
  };

  const openView = (booking) => {
    setSelected(booking);
    setEditMode(false);
    setEditError('');
    setViewModal(true);
  };

  // ===== EDIT MODE HANDLERS =====
  const startEdit = () => {
    setEditPassengers(JSON.parse(JSON.stringify(selected.passengers || [])));
    setEditContact({
      name: selected.contact?.name || '',
      phone: selected.contact?.phone || '',
      email: selected.contact?.email || '',
    });
    setEditError('');
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (!window.confirm('Discard changes?')) return;
    setEditMode(false);
    setEditError('');
  };

  const handlePassengerFieldChange = (index, field, value) => {
    setEditPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleContactFieldChange = (field, value) => {
    setEditContact((prev) => ({ ...prev, [field]: value }));
  };

  const addPassenger = () => {
    setEditPassengers((prev) => [
      ...prev,
      {
        title: 'Mr.',
        fullName: '',
        dob: '',
        gender: 'Male',
        nationality: 'Nepali',
        passportNumber: '',
        type: 'Adult',
      },
    ]);
  };

  const removePassenger = (index) => {
    if (editPassengers.length <= 1) {
      alert('At least one passenger is required.');
      return;
    }
    if (!window.confirm('Remove this passenger?')) return;
    setEditPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEdits = async () => {
    // Validation
    for (let i = 0; i < editPassengers.length; i++) {
      const p = editPassengers[i];
      if (!p.fullName?.trim()) {
        setEditError(`Passenger ${i + 1}: Full name is required`);
        return;
      }
      if (!p.dob) {
        setEditError(`Passenger ${i + 1}: Date of birth is required`);
        return;
      }
      if (!p.passportNumber?.trim()) {
        setEditError(`Passenger ${i + 1}: Passport/ID number is required`);
        return;
      }
    }

    setSavingEdit(true);
    setEditError('');

    try {
      const response = await api.put(`/admin/bookings/${selected.id}/passengers`, {
        passengers: editPassengers,
        contact: editContact,
      });

      if (response.data.success) {
        setSelected(response.data.booking);
        setEditMode(false);
        fetchBookings();
        alert('✓ Passenger details updated successfully');
      }
    } catch (err) {
      console.error('Update error:', err.response?.data);
      const errors = err.response?.data?.errors;
      if (errors) {
        setEditError(Object.values(errors).flat().join(' • '));
      } else {
        setEditError(err.response?.data?.message || 'Update failed');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const statusColor = (s) => ({
    paid: '#10B981',
    pending: '#F2A541',
    failed: '#DC2626',
    cancelled: '#6B7280',
  }[s] || '#5A6B7A');

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>{bookings.length} bookings</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="filter-tabs">
            {['all', 'paid', 'pending', 'failed', 'cancelled'].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="admin-search"
              placeholder="Search by reference, user name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="admin-btn primary">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="admin-loading">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">No bookings found</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Flight</th>
                  <th>Passengers</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="cell-mono">{b.transaction_uuid}</div>
                      <div className="cell-muted">
                        {new Date(b.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="cell-strong">{b.user?.name || '—'}</div>
                      <div className="cell-muted">{b.user?.email || ''}</div>
                    </td>
                    <td>
                      <div className="cell-strong">{b.flight?.from_city} → {b.flight?.to_city}</div>
                      <div className="cell-muted">{b.flight?.airline} • {b.flight?.flight_number}</div>
                    </td>
                    <td>{b.passengers?.length || 0}</td>
                    <td className="cell-strong">Rs. {Number(b.total_amount).toLocaleString()}</td>
                    <td>
                      <span className="status-pill" style={{ background: statusColor(b.payment_status) + '20', color: statusColor(b.payment_status) }}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="icon-btn" title="View / Edit" onClick={() => openView(b)}>👁️</button>
                      {b.payment_status === 'pending' && (
                        <button className="icon-btn" title="Confirm" onClick={() => confirmBooking(b.id)} disabled={working}>✓</button>
                      )}
                      {b.payment_status !== 'cancelled' && (
                        <button className="icon-btn" title="Cancel" onClick={() => cancelBooking(b.id)} disabled={working}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW / EDIT MODAL */}
      {viewModal && selected && (
        <div className="modal-overlay" onClick={() => !savingEdit && setViewModal(false)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Booking {selected.transaction_uuid}
                {editMode && <span style={{ marginLeft: 10, color: '#F2A541', fontSize: 13 }}>— EDITING</span>}
              </h2>
              <button className="modal-close" onClick={() => !savingEdit && setViewModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {editError && <div className="form-error-banner">{editError}</div>}

              {/* FLIGHT (read-only) */}
              <div className="detail-section">
                <h3>Flight Information</h3>
                <div className="detail-grid">
                  <div><span>Airline</span><strong>{selected.flight?.airline}</strong></div>
                  <div><span>Flight No.</span><strong>{selected.flight?.flight_number}</strong></div>
                  <div><span>Route</span><strong>{selected.flight?.from_city} → {selected.flight?.to_city}</strong></div>
                  <div><span>Departure</span><strong>{selected.flight?.departure_time}</strong></div>
                  <div><span>Arrival</span><strong>{selected.flight?.arrival_time}</strong></div>
                  <div><span>Duration</span><strong>{selected.flight?.duration}</strong></div>
                </div>
              </div>

              {/* CONTACT */}
              <div className="detail-section">
                <h3>Contact</h3>
                {editMode ? (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        value={editContact.name}
                        onChange={(e) => handleContactFieldChange('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        value={editContact.phone}
                        onChange={(e) => handleContactFieldChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group form-wide">
                      <label>Email</label>
                      <input
                        type="email"
                        value={editContact.email}
                        onChange={(e) => handleContactFieldChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="detail-grid">
                    <div><span>Name</span><strong>{selected.contact?.name}</strong></div>
                    <div><span>Phone</span><strong>{selected.contact?.phone}</strong></div>
                    <div><span>Email</span><strong>{selected.contact?.email || '—'}</strong></div>
                  </div>
                )}
              </div>

              {/* PASSENGERS */}
              <div className="detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>
                    Passengers ({editMode ? editPassengers.length : selected.passengers?.length})
                  </h3>
                  {editMode && (
                    <button className="admin-btn small primary" onClick={addPassenger} type="button">
                      + Add Passenger
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="edit-passengers-list">
                    {editPassengers.map((p, i) => (
                      <div className="edit-passenger-card" key={i}>
                        <div className="edit-passenger-header">
                          <div className="pax-mini-num">{i + 1}</div>
                          <strong>Passenger {i + 1}</strong>
                          <button
                            type="button"
                            className="icon-btn danger-icon"
                            onClick={() => removePassenger(i)}
                            title="Remove"
                          >
                            🗑️
                          </button>
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label>Title</label>
                            <select
                              value={p.title}
                              onChange={(e) => handlePassengerFieldChange(i, 'title', e.target.value)}
                            >
                              <option value="Mr.">Mr.</option>
                              <option value="Mrs.">Mrs.</option>
                              <option value="Ms.">Ms.</option>
                              <option value="Master">Master</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Type</label>
                            <select
                              value={p.type}
                              onChange={(e) => handlePassengerFieldChange(i, 'type', e.target.value)}
                            >
                              <option value="Adult">Adult</option>
                              <option value="Child">Child</option>
                            </select>
                          </div>

                          <div className="form-group form-wide">
                            <label>Full Name</label>
                            <input
                              value={p.fullName}
                              onChange={(e) => handlePassengerFieldChange(i, 'fullName', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Date of Birth</label>
                            <input
                              type="date"
                              value={p.dob}
                              onChange={(e) => handlePassengerFieldChange(i, 'dob', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Gender</label>
                            <select
                              value={p.gender}
                              onChange={(e) => handlePassengerFieldChange(i, 'gender', e.target.value)}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Nationality</label>
                            <input
                              value={p.nationality}
                              onChange={(e) => handlePassengerFieldChange(i, 'nationality', e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Passport / Citizenship No.</label>
                            <input
                              value={p.passportNumber}
                              onChange={(e) => handlePassengerFieldChange(i, 'passportNumber', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="passengers-mini">
                    {selected.passengers?.map((p, i) => (
                      <div className="pax-mini-row" key={i}>
                        <div className="pax-mini-num">{i + 1}</div>
                        <div className="pax-mini-body">
                          <div className="cell-strong">{p.title} {p.fullName}</div>
                          <div className="cell-muted">
                            {p.type} • {p.gender} • DOB: {p.dob} • {p.nationality} • ID: {p.passportNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PAYMENT (read-only) */}
              <div className="detail-section">
                <h3>Payment</h3>
                <div className="detail-grid">
                  <div><span>Base Fare</span><strong>Rs. {Number(selected.base_fare).toLocaleString()}</strong></div>
                  <div><span>Discount</span><strong>Rs. {Number(selected.discount).toLocaleString()}</strong></div>
                  <div><span>VAT</span><strong>Rs. {Number(selected.vat).toLocaleString()}</strong></div>
                  <div><span>Total</span><strong>Rs. {Number(selected.total_amount).toLocaleString()}</strong></div>
                  <div><span>Status</span>
                    <strong style={{ color: statusColor(selected.payment_status) }}>
                      {selected.payment_status.toUpperCase()}
                    </strong>
                  </div>
                  <div><span>Method</span><strong>{selected.payment_method || '—'}</strong></div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="modal-footer">
                {editMode ? (
                  <>
                    <button className="admin-btn ghost" onClick={cancelEdit} disabled={savingEdit}>
                      Cancel
                    </button>
                    <button className="admin-btn primary" onClick={saveEdits} disabled={savingEdit}>
                      {savingEdit ? 'Saving…' : '✓ Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="admin-btn primary" onClick={startEdit}>
                      ✏️ Edit Passengers
                    </button>
                    {selected.payment_status === 'pending' && (
                      <button className="admin-btn success" onClick={() => confirmBooking(selected.id)} disabled={working}>
                        Confirm as Paid
                      </button>
                    )}
                    {selected.payment_status !== 'cancelled' && (
                      <button className="admin-btn danger" onClick={() => cancelBooking(selected.id)} disabled={working}>
                        Cancel Booking
                      </button>
                    )}
                    <button className="admin-btn ghost" onClick={() => setViewModal(false)}>
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;