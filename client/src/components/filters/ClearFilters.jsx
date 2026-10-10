import { FiX } from 'react-icons/fi';

function ClearFilters({ onClear }) {
  return (
    <button className="clear-filters" onClick={onClear}>
      <FiX />
      <span>Clear filters</span>
    </button>
  );
}

export default ClearFilters;