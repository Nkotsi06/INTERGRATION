function DatePicker({ label, value, onChange, required, error, min, max }) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        type="date"
        className={`form-input ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default DatePicker;