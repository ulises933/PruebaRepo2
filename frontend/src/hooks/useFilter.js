import { useState, useMemo } from "react";

/**
 * Custom hook for filtering an array of items based on filter criteria
 *
 * @param {Array} items - Array of items to filter
 * @param {Object} initialFilters - Initial filter criteria object
 * @returns {Object} Object containing:
 *   - filters: Current filter criteria
 *   - filteredItems: Array of items matching current filters
 *   - updateFilter: Function to update a single filter value
 */
export const useFilter = (items, initialFilters = {}) => {
  // State to track filter criteria
  const [filters, setFilters] = useState(initialFilters);

  // Memoized filtered items based on current filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // If no filter value, include item
        if (!value) return true;
        // Check if item property includes filter value (case insensitive)
        return item[key]?.toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [items, filters]);

  /**
   * Updates a single filter criterion
   * @param {string} key - Filter key to update
   * @param {string} value - New filter value
   */
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    filters,
    filteredItems,
    updateFilter,
  };
};
