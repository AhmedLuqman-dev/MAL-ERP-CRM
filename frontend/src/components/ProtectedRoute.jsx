import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../utils/permissions';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-charcoal-200 border-t-charcoal-700 rounded-full animate-spin" />
          <p className="text-sm text-charcoal-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!hasPermission(user.role, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
