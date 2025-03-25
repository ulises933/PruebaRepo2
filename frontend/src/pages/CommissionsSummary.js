import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useCommissions } from "../hooks/useCommissions";
import { useFilter } from "../hooks/useFilter";
import { usePagination } from "../hooks/usePagination";
import { AlertModal } from "../components/common/AlertModal";
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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ArticleDetails } from "../components/commissions/ArticleDetails";
import { StatusSelect } from "../components/commissions/StatusSelect";
import CommissionsFilters from "../components/commissions/CommissionsFilters";
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

/**
 * CommissionsSummary component displays a summary of commission data with filtering,
 * pagination and status management capabilities.
 */
function CommissionsSummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

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
  } = useFilter(invoices, { seller: "", status: "" });

  const {
    page,
    setPage,
    paginatedItems: displayedInvoices,
    pageCount,
  } = usePagination(filteredInvoices);

  // UI state management
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCut, setIsGeneratingCut] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false });
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
        inv.id === id ? { ...inv, status: newStatus.toLowerCase() } : inv
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
      const payload = invoices.map(({ id, status, penalty, monthly_cut_id }) => ({
        id,
        status,
        penalty,
        monthly_cut_id,
      }));

      await saveInvoiceStatuses(payload, user?.username || "system_user");

      setAlertModal({
        open: true,
        title: "Success",
        message: "Changes saved successfully",
        severity: "success",
      });
    } catch (err) {
      setAlertModal({
        open: true,
        title: "Error",
        message: err.message.includes("BillingCycleDoesNotExistError")
          ? "No billing cycle has been created yet"
          : "Error saving changes",
        severity: "error",
      });
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
      await closeBillingCycle(
        selectedDate.year,
        selectedDate.month,
        user?.username || "system_user",
        "0",
        "08",
        "EN"
      );
      setAlertModal({
        open: true,
        title: "Success",
        message: "Billing cycle closed successfully",
        severity: "success",
        onConfirm: () =>
          navigate(`/monthly-cut/${selectedDate.year}/${selectedDate.month}`),
      });
    } catch (err) {
      setAlertModal({
        open: true,
        title: "Error",
        message: err.message.includes("ClosedBillingCycleError")
          ? "This billing cycle has already been closed"
          : "Error closing billing cycle",
        severity: "error",
      });
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
        <StyledTableCell className="cell-actions text-center">
          {/* actions */}
        </StyledTableCell>
        <StyledTableCell className="cell-amount text-center">
          ${(inv.total_amount || 0).toFixed(2)}
        </StyledTableCell>
        <StyledTableCell className="cell-commission text-center">
          ${(inv.commission_amount || 0).toFixed(2)}
        </StyledTableCell>
        <StyledTableCell className="cell-status text-center">
          <StatusSelect
            value={inv.status}
            onChange={(e) => handleStatusChange(inv.id, e.target.value)}
            t={t}
          />
        </StyledTableCell>
      </TableRow>
    ),
    [handleStatusChange, t]
  );

  return (
    <Layout>
      <PageTitle variant="h5">{t("commissionsTitle")}</PageTitle>

      <CommissionsFilters
        year={selectedDate.year}
        month={selectedDate.month}
        filters={filters}
        onFilterChange={updateFilter}
        onDateChange={handleDateChange}
        t={t}
      />

      {fetchError && (
        <StyledAlert severity="error">
          {t("errorLoadingCommissions")}
        </StyledAlert>
      )}

      {isLoading && (
        <StyledAlert severity="info">{t("loadingCommissions")}</StyledAlert>
      )}

      <ContentWrapper>
        {!isLoading && !fetchError && (!invoices || invoices.length === 0) && (
          <StyledAlert severity="info">
            {t("noCommissionsFound", {
              month: selectedDate.month,
              year: selectedDate.year,
            })}
          </StyledAlert>
        )}

        {invoices && invoices.length > 0 && (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell className="header text-center cell-id">
                      {t("invoiceId")} (DB)
                    </StyledTableCell>
                    <StyledTableCell className="header text-center cell-doc">
                      {t("billingDocument")}
                    </StyledTableCell>
                    <StyledTableCell className="header text-center cell-actions">
                      {t("actions")}
                    </StyledTableCell>
                    <StyledTableCell className="header text-center cell-amount">
                      {t("totalAmount")}
                    </StyledTableCell>
                    <StyledTableCell className="header text-center cell-commission">
                      {t("totalCommission")}
                    </StyledTableCell>
                    <StyledTableCell className="header cell-status text-center">
                      {t("currentStatus")}
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
              </Table>
            </TableContainer>

            {displayedInvoices.map((inv) => (
              <StyledAccordion
                key={inv.id}
                expanded={expandedRow === inv.id}
                onChange={() =>
                  setExpandedRow(expandedRow === inv.id ? null : inv.id)
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>{renderInvoiceRow(inv)}</TableBody>
                    </Table>
                  </TableContainer>
                </AccordionSummary>
                <AccordionDetails>
                  <ArticleDetails articles={inv.items} t={t} />
                </AccordionDetails>
              </StyledAccordion>
            ))}
          </>
        )}
      </ContentWrapper>

      <BottomActionsContainer>
        <PaginationWrapper>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            size="small"
          />
        </PaginationWrapper>

        <ActionButtonsWrapper>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            disabled={isSaving || isGeneratingCut}
            sx={buttonStyles}
          >
            {t("saveChanges")}
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateCut}
            disabled={isSaving || isGeneratingCut}
            sx={buttonStyles}
          >
            {t("generateMonthlyCut")}
          </Button>
        </ActionButtonsWrapper>
      </BottomActionsContainer>

      <AlertModal
        open={alertModal.open}
        onClose={() => setAlertModal({ open: false })}
        title={alertModal.title}
        message={alertModal.message}
        severity={alertModal.severity}
        onConfirm={alertModal.onConfirm}
      />
    </Layout>
  );
}

export default CommissionsSummary;
