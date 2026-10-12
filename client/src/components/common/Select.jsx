import { useId } from 'react';

function Select({ label, value, onChange, options, required, error, name, ...props }) {
  const generatedId = useId();
  const id = props.id || name || `select-${generatedId}`;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name || id}
        className={`form-select ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="form-error" id={errorId}>{error}</span>
      )}
    </div>
  );
}

export default Select;