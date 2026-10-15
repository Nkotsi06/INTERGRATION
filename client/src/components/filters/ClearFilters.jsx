function ClearFilters({ onClear }) {
  return (
    <button className="clear-filters" onClick={onClear}>
      <span aria-hidden="true">✕</span>
      <span>Clear filters</span>
    </button>
  );
}

export default ClearFilters;