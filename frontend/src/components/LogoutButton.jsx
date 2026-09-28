import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} style={{
      background: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '8px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: '600'
    }}>
      Logout
    </button>
  );
}

export default LogoutButton;