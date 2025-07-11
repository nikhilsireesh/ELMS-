import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import HODLayout from './layouts/HODLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />

        {/* Protected routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod/*"
          element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HODLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" />
              ) : user?.role === 'hod' ? (
                <Navigate to="/hod/dashboard" />
              ) : (
                <Navigate to="/employee/dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App; 