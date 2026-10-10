import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import PasswordInput from '../../components/common/PasswordInput';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { changePassword } from '../../api/citizenApi';
import { useNotification } from '../../context/NotificationContext';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const validate = () => {
    const next = {};
    if (!currentPassword) next.currentPassword = 'Enter your current password.';
    if (!newPassword) next.newPassword = 'Enter a new password.';
    else if (newPassword.length < 8)
      next.newPassword = 'At least 8 characters.';
    else if (!/\d/.test(newPassword))
      next.newPassword = 'Must contain at least one number.';
    if (newPassword !== confirmPassword)
      next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      success('Password changed successfully');
      navigate('/citizen/profile');
    } catch (err) {
      setServerError(
        err.message || 'Could not change your password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Change password"
      showBack
      backPath="/citizen/profile"
    >
      <h1>Change password</h1>
      <p className="text-muted">
        Choose a password you have not used before.
      </p>

      {serverError && <Alert type="error" message={serverError} />}

      <form onSubmit={handleSubmit} noValidate>
        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
          error={errors.currentPassword}
        />
        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          error={errors.newPassword}
          helpText="At least 8 characters, including a number"
        />
        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
        />

        <FormActions
          primaryLabel="Save password"
          onPrimary={handleSubmit}
          primaryLoading={loading}
          onSecondary={() => navigate('/citizen/profile')}
        />
      </form>
    </PageWrapper>
  );
}

export default ChangePassword;