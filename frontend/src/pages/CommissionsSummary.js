import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useCommissions } from "../hooks/useCommissions";
import { useFilter } from "../hooks/useFilter";
import { usePagination } from "../hooks/usePagination";
import {
  saveInvoiceStatuses,
  closeBillingCycle,
} from "../services/commissionsService";
import Layout from "../components/Layout";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ArticleDetails } from "../components/commissions/summary/ArticleDetails";
import { StatusSelect } from "../components/commissions/summary/StatusSelect";
import CommissionsFilters from "../components/commissions/summary/CommissionsFilters";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import {
  PageTitle,
  StyledAlert,
  StyledAccordion,
  StyledTableCell,
  PaginationWrapper,
  ActionButtonsWrapper,
  buttonStyles,
  ContentWrapper,
  BottomActionsContainer,
} from "../components/commissions/styles/CommissionsStyles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Notification from "../components/common/Notification";
import { InvoiceRow } from "../components/commissions/summary/InvoiceRow";
import { TableHeader } from "../components/commissions/summary/TableHeader";
import { InvoiceAccordion } from "../components/commissions/summary/InvoiceAccordion";
import { BottomActions } from "../components/commissions/summary/BottomActions";
import { useAuthSSO } from "../context/AuthContextSSO";

/**
 * CommissionsSummary component displays a summary of commission data with filtering,
 * pagination and status management capabilities.
 */
function CommissionsSummary() {
  const navigate = useNavigate();
  const { ssoUser } = useAuthSSO();
  const { t } = useLanguage();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Initialize date state with current year and month
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs();
    return {
      year: today.year(),
      month: today.month() + 1, // dayjs months are 0-indexed
    };
  });

  // Custom hooks for managing commissions data, filtering and pagination
  const {
    invoices,
    setInvoices,
    isLoading,
    error: fetchError,
    fetchCommissions,
  } = useCommissions(selectedDate.year, selectedDate.month);

  const {
    filters,
    filteredItems: filteredInvoices,
    updateFilter,
  } = useFilter(invoices, { seller: "", status: "" }, (item, filters) => {
    return (
      (!filters.seller ||
        item.seller?.toLowerCase().includes(filters.seller.toLowerCase())) &&
      (!filters.status ||
        (item.estatus || item.status)?.toLowerCase() ===
          filters.status.toLowerCase())
    );
  });

  const {
    page,
    setPage,
    paginatedItems: displayedInvoices,
    pageCount,
  } = usePagination(filteredInvoices);

  // UI state management
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCut, setIsGeneratingCut] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [expandedRow, setExpandedRow] = useState(null);

  // Initial data fetch
  useEffect(() => {
    fetchCommissions();
  }, [selectedDate.year, selectedDate.month]);

  // Handler for date filter changes
  const handleDateChange = useCallback(
    (year, month) => {
      setSelectedDate({ year, month });
      setPage(1); // Reset to first page when date changes
    },
    [setPage]
  );

  // Handler for status changes in individual invoices
  const handleStatusChange = useCallback((id, newStatus) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, estatus: newStatus.toLowerCase() } : inv
      )
    );
  }, []);

  // Add handler for penalty changes
  const handlePenaltyChange = useCallback((id, newValue) => {
    // Ensure the value is a valid number or empty
    const numValue = newValue === "" ? 0 : parseFloat(newValue);
    if (isNaN(numValue)) return;

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, penalty_amount: numValue } : inv
      )
    );
  }, []);

  /**
   * Handles saving changes to invoice statuses
   * Makes API call to save updated statuses and shows success/error message
   */
  const handleSaveChanges = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const payload = invoices.map(({ id, status, monthly_cut_id }) => ({
        id,
        status: status?.toLowerCase() || "pending",
        monthly_cut_id: monthly_cut_id || 0,
      }));

      await saveInvoiceStatuses(payload, ssoUser?.username);
      showNotification(t("changes_saved_successfully"), "success");
    } catch (err) {
      showNotification(
        err.message.includes("BillingCycleDoesNotExistError")
          ? t("noBillingCycle")
          : t("error_saving"),
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles generating monthly cut/closing billing cycle
   * Makes API call to close cycle and navigates to monthly cut view on success
   */
  const handleGenerateCut = async () => {
    if (isGeneratingCut) return;

    try {
      setIsGeneratingCut(true);
      await closeBillingCycle({
        year: selectedDate.year,
        month: selectedDate.month,
        user: ssoUser?.username,
        personnel_number: "0",
        customer_price_group: "",
        language: "EN",
      });

      showNotification(t("billingCycleClosed"), "success");
      navigate(`/monthly-cut/${selectedDate.year}/${selectedDate.month}`);
    } catch (err) {
      showNotification(
        err.message.includes("ClosedBillingCycleError")
          ? t("billingCycleAlreadyClosed")
          : t("errorClosingBillingCycle"),
        "error"
      );
    } finally {
      setIsGeneratingCut(false);
    }
  };

  // Memoized invoice row renderer
  const renderInvoiceRow = useCallback(
    (inv) => (
      <TableRow key={inv.id}>
        <StyledTableCell className="cell-id text-center">
          {inv.id}
        </StyledTableCell>
        <StyledTableCell className="cell-doc text-center">
          {inv.documento_facturacion || inv.billing_document || "N/A"}
        </StyledTableCell>
        <StyledTableCell className="cell-amount text-center">
          ${(inv.total_amount || 0).toFixed(2)}
        </StyledTableCell>
        <StyledTableCell className="cell-commission text-center">
          ${(inv.commission_amount || 0).toFixed(2)}
        </StyledTableCell>
        <StyledTableCell className="cell-penalty text-center">
          <TextField
            value={inv.penalty_amount || 0}
            onChange={(e) => handlePenaltyChange(inv.id, e.target.value)}
            type="number"
            size="small"
            inputProps={{
              min: 0,
              step: 0.01,
              style: {
                padding: "2px 4px",
                fontSize: "0.65rem",
                textAlign: "center",
                width: "80px",
              },
            }}
          />
        </StyledTableCell>
        <StyledTableCell className="cell-status text-center">
          <StatusSelect
            value={inv.estatus || inv.status}
            onChange={(e) => handleStatusChange(inv.id, e.target.value)}
            t={t}
          />
        </StyledTableCell>
      </TableRow>
    ),
    [handleStatusChange, handlePenaltyChange, t]
  );

  // Add a helper function to get available statuses
  const getAvailableStatuses = useMemo(() => {
    if (!invoices) return [];

    const statusSet = new Set();
    invoices.forEach((inv) => {
      const status = (inv.estatus || inv.status)?.toLowerCase();
      if (status) statusSet.add(status);
    });

    return Array.from(statusSet);
  }, [invoices]);

  // Update the showNotification helper
  const showNotification = useCallback((message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  // Add handleCloseNotification
  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Update error effect
  useEffect(() => {
    if (fetchError) {
      showNotification(t("errorLoadingCommissions"), "error");
    }
  }, [fetchError, showNotification, t]);

  return (
    <Layout>
      {isSmallScreen && (
        <PageTitle variant="h5">{t("commissionsTitle")}</PageTitle>
      )}

      <CommissionsFilters
        year={selectedDate.year}
        month={selectedDate.month}
        filters={filters}
        onFilterChange={updateFilter}
        onDateChange={handleDateChange}
        availableStatuses={getAvailableStatuses}
        t={t}
      />

      <ContentWrapper>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 3,
            }}
          >
            <CircularProgress size={20} />
          </Box>
        ) : (
          <>
            {!fetchError &&
              (!filteredInvoices || filteredInvoices.length === 0) && (
                <StyledAlert severity="info">
                  {filters.status || filters.seller
                    ? t("noMatchingResults")
                    : t("noCommissionsFound", {
                        month: selectedDate.month,
                        year: selectedDate.year,
                      })}
                </StyledAlert>
              )}

            {filteredInvoices && filteredInvoices.length > 0 && (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHeader t={t} />
                  </Table>
                </TableContainer>

                {displayedInvoices.map((inv) => (
                  <InvoiceAccordion
                    key={inv.id}
                    inv={inv}
                    expanded={expandedRow === inv.id}
                    onExpand={() =>
                      setExpandedRow(expandedRow === inv.id ? null : inv.id)
                    }
                    onStatusChange={handleStatusChange}
                    onPenaltyChange={handlePenaltyChange}
                    t={t}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ContentWrapper>

      <BottomActions
        pageCount={pageCount}
        page={page}
        onPageChange={(e, val) => setPage(val)}
        onSave={handleSaveChanges}
        onGenerateCut={handleGenerateCut}
        isSaving={isSaving}
        isGeneratingCut={isGeneratingCut}
        t={t}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Layout>
  );
}

export default CommissionsSummary;
