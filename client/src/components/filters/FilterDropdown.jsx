import { FiChevronDown } from 'react-icons/fi';

function FilterDropdown({ label, value, options, onChange }) {
  return (
    <div className="filter-dropdown">
      <label className="filter-label">{label}</label>
      <div className="filter-select-wrapper">
        <select
          className="filter-select"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="filter-select-icon" />
      </div>
    </div>
  );
}

export default FilterDropdown;