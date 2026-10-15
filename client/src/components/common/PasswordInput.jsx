import { useState } from 'react';

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  autoComplete = 'current-password',
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <div className="password-field">
        <input
          type={visible ? 'text' : 'password'}
          className={`form-input ${error ? 'input-error' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {helpText && !error && <span className="form-help">{helpText}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default PasswordInput;