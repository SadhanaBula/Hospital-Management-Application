import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ requiredRole }) => {
  const [authState, setAuthState] = useState({
    isChecking: true,
    isAuthenticated: false,
    userRole: null
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      let authenticated = false;
      let userRole = null;

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          userRole = userData.role;
          authenticated = true;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      setAuthState({
        isChecking: false,
        isAuthenticated: authenticated,
        userRole
      });
    } catch (error) {
      setAuthState({
        isChecking: false,
        isAuthenticated: false,
        userRole: null
      });
    }
  }, []);

  if (authState.isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-2">Verifying your access...</p>
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.userRole) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const userRoleUpper = authState.userRole.toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();

    if (userRoleUpper === requiredRoleUpper) return <Outlet />;

    // Redirect based on actual role
    if (userRoleUpper === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (userRoleUpper === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (userRoleUpper === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
