import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Import Auth Pages
import Login from '../pages/auth/Login';

// Import Dashboard Pages
import Dashboard from '../pages/dashboard/Dashboard';

// Import Resource Pages
import ResourceList from '../pages/resources/ResourceList';
import AddResource from '../pages/resources/AddResource';
import EditResource from '../pages/resources/EditResource';

// Import Booking Pages
import MyBookings from '../pages/bookings/MyBookings';
import BookResource from '../pages/bookings/BookResource';
import AdminBookings from '../pages/bookings/AdminBookings';

// Import Ticket Pages
import TicketList from '../pages/tickets/TicketList';
import CreateTicket from '../pages/tickets/CreateTicket';
import TicketDetails from '../pages/tickets/TicketDetails';

/**
 * ProtectedRoute component - redirects to login if user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

/**
 * AdminRoute component - redirects to dashboard if user is not authenticated or not an admin.
 */
const AdminRoute = ({ children }) => {
  const { token, isAdmin } = useContext(AuthContext);
  
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root path redirects to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Resource Management */}
      <Route path="/resources" element={
        <ProtectedRoute>
          <ResourceList />
        </ProtectedRoute>
      } />
      <Route path="/resources/add" element={
        <AdminRoute>
          <AddResource />
        </AdminRoute>
      } />
      <Route path="/resources/edit/:id" element={
        <AdminRoute>
          <EditResource />
        </AdminRoute>
      } />

      {/* Booking Management */}
      <Route path="/bookings" element={
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      } />
      <Route path="/bookings/book/:id" element={
        <ProtectedRoute>
          <BookResource />
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <AdminRoute>
          <AdminBookings />
        </AdminRoute>
      } />

      {/* Maintenance Tickets */}
      <Route path="/tickets" element={
        <ProtectedRoute>
          <TicketList />
        </ProtectedRoute>
      } />
      <Route path="/tickets/create" element={
        <ProtectedRoute>
          <CreateTicket />
        </ProtectedRoute>
      } />
      <Route path="/tickets/:id" element={
        <ProtectedRoute>
          <TicketDetails />
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
