import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TouristDashboard from './pages/TouristDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyContactsPage from './pages/EmergencyContactsPage';
import GeofenceManagerPage from './pages/GeofenceManagerPage';
import IncidentsPage from './pages/IncidentsPage';
import TouristsMonitoringPage from './pages/TouristsMonitoringPage';
import TouristProfile from './pages/TouristProfile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Tourist Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['tourist', 'admin']}>
              <TouristDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute allowedRoles={['tourist', 'admin']}>
              <EmergencyContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents"
          element={
            <ProtectedRoute allowedRoles={['tourist', 'admin']}>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['tourist', 'admin']}>
              <TouristProfile />
            </ProtectedRoute>
          }
        />

        {/* Protected Administrator Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/geofences"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GeofenceManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/incidents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <IncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tourists"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TouristsMonitoringPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
