import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { register } from '../../api/authApi';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};

    if (!form.username.trim()) {
      next.username = 'Please choose a username.';
    } else if (form.username.trim().length < 3 || form.username.trim().length > 50) {
      next.username = 'Username must be 3-50 characters.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim())) {
      next.username = 'Username may contain letters, numbers, dots, dashes, underscores only.';
    }

    if (!form.email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      next.password = 'Please choose a password.';
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    } else if (!/\d/.test(form.password)) {
      next.password = 'Password must contain at least one number.';
    }

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildApiError = (err) => {
    // The backend returns:
    //   { message: "Validation failed", errors: [{ field, message }] }
    // or
    //   { message: "Username already taken" }
    if (err && Array.isArray(err.errors) && err.errors.length > 0) {
      return err.errors
        .map((entry) => {
          if (entry.field && entry.message) {
            return `${labelFor(entry.field)}: ${entry.message}`;
          }
          return entry.message || 'Invalid value.';
        })
        .join(' ');
    }
    if (err && typeof err.message === 'string' && err.message.length > 0) {
      return err.message;
    }
    return 'Registration failed. Please try again in a moment.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      success('Account created');
      navigate('/registration-received', {
        state: { username: form.username.trim() },
      });
    } catch (err) {
      setApiError(buildApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card-title">Create your account</h1>
        <p className="auth-card-subtitle">
          Home Affairs will complete the rest of your details.
        </p>

        {apiError && <Alert type="error" message={apiError} />}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            autoComplete="username"
            required
            error={errors.username}
          />

          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
            required
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete="new-password"
            required
            error={errors.password}
            helpText="At least 8 characters, including a number"
          />

          <PasswordInput
            label="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            autoComplete="new-password"
            required
            error={errors.confirmPassword}
          />

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/login">Already have an account? Log in</Link>
        </div>
      </div>
    </div>
  );
}

function labelFor(field) {
  const map = {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    role: 'Role',
  };
  return map[field] || field;
}

export default Register;