import { useEffect, useRef } from 'react';
import Button from '../common/Button';

function DeactivatePanel({
  user,
  action = 'deactivate', // 'deactivate' | 'activate'
  onCancel,
  onConfirm,
  loading = false,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  const isDeactivate = action === 'deactivate';

  const title = isDeactivate ? 'Deactivate this user?' : 'Activate this user?';
  const message = isDeactivate
    ? `${user.fullName || user.username} will no longer be able to sign in. Existing audit records will be retained.`
    : `${user.fullName || user.username} will be able to sign in again.`;
  const confirmLabel = isDeactivate ? 'Confirm Deactivate' : 'Confirm Activate';
  const cancelLabel = isDeactivate ? 'Keep Active' : 'Cancel';

  return (
    <div
      className={`confirm-panel ${isDeactivate ? 'confirm-panel-warning' : ''}`}
      ref={ref}
      tabIndex={-1}
      role="alertdialog"
      aria-label={title}
    >
      <h3 className="confirm-panel-title">{title}</h3>
      <p className="confirm-panel-message">{message}</p>

      <div className="confirm-panel-actions">
        <Button
          variant={isDeactivate ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}

export default DeactivatePanel;