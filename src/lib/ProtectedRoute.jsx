import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth';

export default function ProtectedRoute({ roles, role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const allowed = roles || (role ? [role] : null);
  if (allowed) {
    const allowedLower = allowed.map((r) => String(r).toLowerCase());
    const userRoleLower = String(user.role || '').toLowerCase();
    if (!allowedLower.includes(userRoleLower)) return <Navigate to="/denied" replace />;
  }

  // If children provided, render them (used as element prop); otherwise render nested routes
  return children ? children : <Outlet />;
}
