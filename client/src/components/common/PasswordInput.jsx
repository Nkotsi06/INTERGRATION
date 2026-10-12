import { useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  autoComplete = 'current-password',
  name,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const id = props.id || name || `password-${generatedId}`;
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <div className="password-field">
        <input
          id={id}
          name={name || id}
          type={visible ? 'text' : 'password'}
          className={`form-input ${error ? 'input-error' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId || helpId}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {helpText && !error && (
        <span className="form-help" id={helpId}>{helpText}</span>
      )}
      {error && (
        <span className="form-error" id={errorId}>{error}</span>
      )}
    </div>
  );
}

export default PasswordInput;