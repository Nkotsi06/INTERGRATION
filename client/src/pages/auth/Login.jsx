import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getDashboardPath, ROLES } from '../../utils/permissions';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

function Login() {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nationalId.trim()) {
      setError('Please enter your National ID number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ nationalId: nationalId.trim(), password }, ROLES.CITIZEN);
      success('Login successful');
      navigate(
        result.user.mustChangePassword
          ? '/citizen/change-password'
          : getDashboardPath(result.user.role)
      );
    } catch (err) {
      setError(
        err.message ||
          '          National ID or password is incorrect. Check them and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card-title">Welcome back</h1>
        <p className="auth-card-subtitle">
          Sign in to access government services.
        </p>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="National ID number"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 13))}
            inputMode="numeric"
            autoComplete="username"
            required
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Register with an existing National ID</Link>
        </div>

        <div className="auth-links-secondary">
          <Link to="/staff/login">Staff login</Link>
          <span className="auth-links-sep">|</span>
          <Link to="/admin/login">Admin login</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;