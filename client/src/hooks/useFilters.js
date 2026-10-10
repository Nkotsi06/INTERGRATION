import { useState, useMemo } from 'react';

function useFilters(initialFilters, data, filterFn) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterFn(data, filters);
  }, [data, filters, filterFn]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const initial = initialFilters[key];
      return JSON.stringify(value) !== JSON.stringify(initial);
    });
  }, [filters, initialFilters]);

  return { filters, updateFilter, clearFilters, filteredData, hasActiveFilters };
}

export default useFilters;