import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './components/Home';
import Products from './pages/Products';
import FlightResults from './pages/FlightResults';
import FlightDetails from './pages/FlightDetails';
import Booking from './pages/Booking';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFlights from './pages/admin/Flights';
import AdminBookings from './pages/admin/Bookings';
import AdminUsers from './pages/admin/Users';
import MyBookings from './pages/MyBookings';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/flights" element={<ProtectedRoute><FlightResults /></ProtectedRoute>} />
          <Route path="/flight/:id" element={<ProtectedRoute><FlightDetails /></ProtectedRoute>} />
          <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment-failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="flights" element={<AdminFlights />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;