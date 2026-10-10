function DateRangeFilter({ label, value, onChange }) {
  const handleChange = (field, val) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="filter-date-range">
      <label className="filter-label">{label}</label>
      <div className="date-range-inputs">
        <input
          type="date"
          className="filter-date-input"
          value={value?.from || ''}
          onChange={(e) => handleChange('from', e.target.value)}
        />
        <span className="date-range-sep">to</span>
        <input
          type="date"
          className="filter-date-input"
          value={value?.to || ''}
          onChange={(e) => handleChange('to', e.target.value)}
        />
      </div>
    </div>
  );
}

export default DateRangeFilter;