import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While AuthProvider is still asking the server "who am I?", do not
  // redirect. Otherwise we kick the user out before the answer arrives.
  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    // Log the reason so it's visible in the browser console.
    console.warn(
      '[ProtectedRoute] Redirecting to /login. Reason: no user in AuthContext.',
      { path: location.pathname, search: location.search }
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.mustChangePassword && location.pathname !== '/citizen/change-password') {
    return <Navigate to="/citizen/change-password" replace />;
  }

  return children;
}

export default ProtectedRoute;