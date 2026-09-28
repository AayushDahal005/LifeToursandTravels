import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [working, setWorking] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const params = q ? { search: q } : {};
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const toggleActive = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    setWorking(user.id);
    try {
      await api.post(`/admin/users/${user.id}/toggle-active`);
      fetchUsers(search);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Manage Users</h1>
          <p>{users.length} users</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="admin-search"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="admin-btn primary">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="admin-loading">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="cell-strong">{u.name}</td>
                    <td className="cell-muted">{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`pill ${u.role === 'admin' ? 'admin' : 'user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${u.is_active ? 'ok' : 'danger'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="cell-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className={`admin-btn small ${u.is_active ? 'danger' : 'success'}`}
                          onClick={() => toggleActive(u)}
                          disabled={working === u.id}
                        >
                          {working === u.id ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;