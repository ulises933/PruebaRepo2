import { useState, useMemo, useEffect } from "react";

/**
 * Custom hook for handling pagination of an array of items with responsive sizing
 *
 * @param {Array} items - Array of items to paginate
 * @param {number} initialPage - Initial page number (defaults to 1)
 * @param {number} defaultItemsPerPage - Number of items per page (defaults to 10)
 * @returns {Object} Object containing:
 *   - page: Current page number
 *   - setPage: Function to update current page
 *   - paginatedItems: Array of items for current page
 *   - pageCount: Total number of pages
 *   - itemsPerPage: Number of items shown per page
 *   - setItemsPerPage: Function to update items per page
 */
export const usePagination = (
  items = [],
  initialPage = 1,
  defaultItemsPerPage = 13
) => {
  // State to track current page number and items per page
  const [page, setPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Update items per page based on window size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setItemsPerPage(8); // Mobile view
      } else if (width < 960) {
        setItemsPerPage(13); // Tablet view
      } else if (width < 1280) {
        setItemsPerPage(16); // Small desktop
      } else {
        setItemsPerPage(defaultItemsPerPage); // Large desktop
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [defaultItemsPerPage]);

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
    setItemsPerPage,
  };
};
