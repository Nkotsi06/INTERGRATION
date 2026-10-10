import FilterDropdown from './FilterDropdown';
import DateRangeFilter from './DateRangeFilter';
import ClearFilters from './ClearFilters';

function FilterBar({ filters, values, onChange, onClear }) {
  const hasActiveFilters = Object.values(values).some(
    (v) => v !== '' && v !== null && v !== undefined && v !== 'all'
  );

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        {filters.map((filter) => {
          if (filter.type === 'date-range') {
            return (
              <DateRangeFilter
                key={filter.key}
                label={filter.label}
                value={values[filter.key]}
                onChange={(val) => onChange(filter.key, val)}
              />
            );
          }
          return (
            <FilterDropdown
              key={filter.key}
              label={filter.label}
              value={values[filter.key]}
              options={filter.options}
              onChange={(val) => onChange(filter.key, val)}
            />
          );
        })}
      </div>
      {hasActiveFilters && <ClearFilters onClear={onClear} />}
    </div>
  );
}

export default FilterBar;