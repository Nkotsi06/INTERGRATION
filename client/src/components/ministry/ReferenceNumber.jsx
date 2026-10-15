import { useNotification } from '../../context/NotificationContext';

function ReferenceNumber({ value, label = 'Reference Number' }) {
  const { success } = useNotification();

  const copy = () => {
    navigator.clipboard.writeText(value);
    success('Reference number copied');
  };

  return (
    <div className="reference-number">
      <span className="reference-label">{label}</span>
      <div className="reference-value-wrapper">
        <span className="reference-value">{value}</span>
        <button className="reference-copy" onClick={copy} aria-label="Copy">
          Copy
        </button>
      </div>
    </div>
  );
}

export default ReferenceNumber;