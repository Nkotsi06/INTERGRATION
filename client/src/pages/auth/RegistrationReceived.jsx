import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

function RegistrationReceived() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || '';
  const [explainerOpen, setExplainerOpen] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="result-card" style={{ padding: 0, border: 'none' }}>
          <div className="result-icon success">
            <FiCheckCircle />
          </div>
          <h1 className="auth-card-title">Registration received</h1>
          <p className="auth-card-subtitle">
            Your account is created{username ? ` (${username})` : ''}. Home
            Affairs will now capture your details and verify you.
          </p>
          <p className="text-muted">
            Visit your nearest Home Affairs office with your ID document and
            birth certificate.
          </p>

          <div className="result-actions">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button
              variant="secondary"
              onClick={() => setExplainerOpen(true)}
            >
              What happens next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        title="What happens next"
        size="medium"
      >
        <ol className="explainer-list">
          <li>
            <strong>Register</strong> — you create an account with a username
            and password.
          </li>
          <li>
            <strong>Home Affairs completes your record</strong> — an officer
            captures your personal details, uploads your documents, and the
            system generates your National ID automatically.
          </li>
          <li>
            <strong>You are verified</strong> — once the officer confirms your
            details, all services unlock on your dashboard.
          </li>
        </ol>
        <div className="form-actions">
          <Button
            variant="primary"
            onClick={() => setExplainerOpen(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default RegistrationReceived;