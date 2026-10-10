import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getDashboardPath } from '../../utils/permissions';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username: username.trim(), password }, 'STAFF');
      success('Staff login successful');
      navigate(getDashboardPath(result.user.role));
    } catch (err) {
      setError(
        err.message ||
          'Username or password is incorrect. Check them and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card-title">Staff sign in</h1>
        <p className="auth-card-subtitle">
          For government staff accounts only. Citizens use the citizen login.
        </p>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <div className="auth-links-secondary">
          <Link to="/login">Citizen login</Link>
          <span className="auth-links-sep">|</span>
          <Link to="/admin/login">Admin login</Link>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;