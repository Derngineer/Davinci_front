import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  // Pass the attempted path so Login can redirect back after auth
  if (!token) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
