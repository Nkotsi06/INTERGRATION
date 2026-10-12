import { useId } from 'react';

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  disabled = false,
  full = false,
  name,
  ...props
}) {
  const generatedId = useId();
  const id = props.id || name || `input-${generatedId}`;
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`form-field${full ? ' form-grid-full' : ''}`}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name || id}
        type={type}
        className={`form-input ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId || helpId}
        {...props}
      />
      {helpText && !error && (
        <span className="form-help" id={helpId}>{helpText}</span>
      )}
      {error && (
        <span className="form-error" id={errorId}>{error}</span>
      )}
    </div>
  );
}

export default Input;