import { useEffect, useState, useCallback } from "react";
import { getCommissionsByPartner } from "../services/commissionsService";

/**
 * Custom hook for managing commission data fetching and state
 *
 * @param {number} year - The year to fetch commissions for
 * @param {number} month - The month to fetch commissions for
 * @param {string} customer_price_group - The brand to fetch commissions for
 * @returns {Object} Object containing:
 *   - totals: Array of partners with total commission data
 *   - isLoading: Boolean indicating if fetch is in progress
 *   - error: Error message if fetch failed, null otherwise
 */
export const useCommissionsByPartner = (year, month, customer_price_group) => {
  // State for storing commission invoices data
  const [totals, setTotals] = useState([]);
  // Loading state during API calls
  const [isLoading, setIsLoading] = useState(false);
  // Error state for handling API errors
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommissionsByPartner(year, month, customer_price_group);
      setTotals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error fetching commissions");
      setTotals([]);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return {
    totals,
    isLoading,
    error
  };
};
