import { useEffect, useRef, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

function DeletePanel({ user, onCancel, onConfirm, loading = false }) {
  const [typed, setTyped] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  const matches = typed.trim() === user.username;
  const isCitizen = user.role === 'CITIZEN';

  return (
    <div
      className="confirm-panel confirm-panel-danger"
      ref={ref}
      tabIndex={-1}
      role="alertdialog"
      aria-label="Delete user permanently"
    >
      <h3 className="confirm-panel-title">
        Delete {user.fullName || user.username} permanently?
      </h3>
      <p className="confirm-panel-message">
        This cannot be undone. Their past actions stay in the audit log.
        {isCitizen && ' Their Home Affairs record is not affected.'}
      </p>

      <Input
        label={`Type "${user.username}" to confirm`}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
      />

      <div className="confirm-panel-actions">
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={!matches || loading}
        >
          {loading ? 'Deleting…' : 'Delete permanently'}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default DeletePanel;