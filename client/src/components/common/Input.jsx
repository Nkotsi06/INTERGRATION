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
  ...props
}) {
  return (
    <div className={`form-field${full ? ' form-grid-full' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`form-input ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      {helpText && !error && <span className="form-help">{helpText}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default Input;