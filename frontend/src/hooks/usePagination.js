import { useState, useMemo } from "react";

/**
 * Custom hook for handling pagination of an array of items
 *
 * @param {Array} items - Array of items to paginate
 * @param {number} initialPage - Initial page number (defaults to 1)
 * @returns {Object} Object containing:
 *   - page: Current page number
 *   - setPage: Function to update current page
 *   - paginatedItems: Array of items for current page
 *   - pageCount: Total number of pages
 *   - itemsPerPage: Number of items shown per page
 */
export const usePagination = (items = [], initialPage = 1) => {
  // State to track current page number
  const [page, setPage] = useState(initialPage);
  const itemsPerPage = 13; // Set fixed items per page to 13

  // Memoize paginated items and page count calculations
  const { paginatedItems, pageCount } = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    return {
      paginatedItems: items.slice(start, end), // Get items for current page
      pageCount: Math.ceil(items.length / itemsPerPage), // Calculate total pages
    };
  }, [items, page, itemsPerPage]);

  // Reset to first page when items array changes and current page would be empty
  if (page > 1 && paginatedItems.length === 0 && items.length > 0) {
    setPage(1);
  }

  return {
    page,
    setPage,
    paginatedItems,
    pageCount,
    itemsPerPage,
  };
};
