function FilterPill({ label, value, onRemove }) {
  return (
    <span className="filter-pill">
      <span className="filter-pill-label">{label}:</span>
      <span className="filter-pill-value">{value}</span>
      <button className="filter-pill-remove" onClick={onRemove} aria-label="Remove filter">
        ✕
      </button>
    </span>
  );
}

export default FilterPill;