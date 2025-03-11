import { useState, useCallback } from "react";
import { getCommissionsSummary } from "../services/commissionsService";

/**
 * Custom hook for managing commission data fetching and state
 *
 * @param {number} year - The year to fetch commissions for
 * @param {number} month - The month to fetch commissions for
 * @returns {Object} Object containing:
 *   - invoices: Array of commission invoice data
 *   - setInvoices: Function to manually update invoices state
 *   - isLoading: Boolean indicating if fetch is in progress
 *   - error: Error message if fetch failed, null otherwise
 *   - fetchCommissions: Function to trigger commission data fetch
 */
export const useCommissions = (year, month) => {
  // State for storing commission invoices data
  const [invoices, setInvoices] = useState([]);
  // Loading state during API calls
  const [isLoading, setIsLoading] = useState(false);
  // Error state for handling API errors
  const [error, setError] = useState(null);

  /**
   * Fetches commission data for the specified year and month
   * Handles loading states and error handling
   */
  const fetchCommissions = useCallback(async () => {
    if (!year || !month) {
      setError("Year and month are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCommissionsSummary(year, month);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error fetching commissions");
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  return {
    invoices,
    setInvoices,
    isLoading,
    error,
    fetchCommissions,
  };
};
