import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";
import {
  StyledAccordion,
  FilterBox,
  fieldWidths,
} from "./styles/CommissionsStyles";

/**
 * CommissionsFilters Component
 * Provides filtering options for commissions data including:
 * - Year/Month period selection
 * - Seller name search
 * - Status filter dropdown
 *
 * @param {number} year - Selected year
 * @param {number} month - Selected month (1-12)
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Callback when a filter value changes
 * @param {Function} onDateChange - Callback when date selection changes
 * @param {Function} t - Translation function
 */
const CommissionsFilters = ({
  year,
  month,
  filters,
  onFilterChange,
  onDateChange,
  t,
}) => {
  /**
   * Handles date picker changes
   * Validates date and calls onDateChange with year and month
   */
  const handleDateChange = (date) => {
    if (date && date.isValid()) {
      onDateChange(date.year(), date.month() + 1);
    }
  };

  /**
   * Clears the value of a specific filter field
   */
  const handleClearFilter = (field) => {
    onFilterChange(field, "");
  };

  // Create dayjs date object from year and month props
  const selectedDate = dayjs()
    .year(year)
    .month(month - 1);

  return (
    <StyledAccordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight="medium">
          {t("filters")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FilterBox>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            {/* Period Selection */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption">{t("selectPeriod")}</Typography>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  views={["year", "month"]}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        width: fieldWidths.yearMonth,
                        "& .MuiInputBase-input": {
                          fontSize: "0.65rem",
                          padding: "4px 8px",
                        },
                      },
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>

            {/* Seller Search Filter */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption">{t("sellerFilter")}</Typography>
              <TextField
                value={filters.seller || ""}
                onChange={(e) => onFilterChange("seller", e.target.value)}
                size="small"
                sx={{ width: fieldWidths.seller }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: filters.seller && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleClearFilter("seller")}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Status Filter Dropdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption">{t("statusFilter")}</Typography>
              <FormControl size="small" sx={{ width: fieldWidths.status }}>
                <Select
                  value={filters.status || ""}
                  onChange={(e) => onFilterChange("status", e.target.value)}
                  endAdornment={
                    filters.status && (
                      <IconButton
                        size="small"
                        onClick={() => handleClearFilter("status")}
                        sx={{ mr: 2 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <MenuItem value="">{t("all")}</MenuItem>
                  <MenuItem value="pagable">{t("payable")}</MenuItem>
                  <MenuItem value="no pagable">{t("notPayable")}</MenuItem>
                  <MenuItem value="pendiente">{t("pending")}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </FilterBox>
      </AccordionDetails>
    </StyledAccordion>
  );
};

export default CommissionsFilters;
