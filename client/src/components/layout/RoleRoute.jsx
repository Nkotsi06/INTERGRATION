import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/permissions';

function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (!user) {
    console.warn(
      '[RoleRoute] Redirecting to /login. Reason: no user in AuthContext.',
      { requiredRoles: roles, userRole: user?.role }
    );
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    console.warn(
      `[RoleRoute] Redirecting to ${getDashboardPath(user.role)}. ` +
      `Reason: user role "${user.role}" is not in [${roles.join(', ')}].`
    );
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

export default RoleRoute;