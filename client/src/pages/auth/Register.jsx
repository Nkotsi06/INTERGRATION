import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithNationalId } from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

function Register() {
  const [nationalId, setNationalId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{13}$/.test(nationalId.trim())) {
      setError('Enter your 13-digit National ID number.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username.trim())) {
      setError('Choose a username of 3–50 letters, numbers, dots, dashes, or underscores.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerWithNationalId({
        nationalId: nationalId.trim(),
        username: username.trim(),
      });
      setCredentials(result);
    } catch (requestError) {
      setError(requestError.message || 'Could not verify your National ID.');
    } finally {
      setLoading(false);
    }
  };

  if (credentials) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card-title">Your account is ready</h1>
          <p className="auth-card-subtitle">
            Save this temporary password. You will be required to change it the first time you sign in.
          </p>
          <div className="form-section">
            <p><strong>National ID:</strong> {credentials.nationalId}</p>
            <p><strong>Username:</strong> {credentials.username}</p>
            <p><strong>Temporary password:</strong></p>
            <code style={{ display: 'block', padding: 12, overflowWrap: 'anywhere' }}>
              {credentials.temporaryPassword}
            </code>
          </div>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Continue to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card-title">Register with your National ID</h1>
        <p className="auth-card-subtitle">
          Your ID is checked against the national citizen registry before an account is created.
        </p>
        {error && <Alert type="error" message={error} />}
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="National ID number"
            value={nationalId}
            onChange={(event) => setNationalId(event.target.value.replace(/\D/g, '').slice(0, 13))}
            inputMode="numeric"
            autoComplete="off"
            required
          />
          <Input
            label="Choose a username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Checking registry…' : 'Verify ID and register'}
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/login">Already registered? Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
