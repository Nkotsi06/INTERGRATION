import { useId } from 'react';

function DatePicker({ label, value, onChange, required, error, min, max, name, ...props }) {
  const generatedId = useId();
  const id = props.id || name || `date-${generatedId}`;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name || id}
        type="date"
        className={`form-input ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <span className="form-error" id={errorId}>{error}</span>
      )}
    </div>
  );
}

export default DatePicker;