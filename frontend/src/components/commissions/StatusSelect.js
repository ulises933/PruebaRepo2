import React from "react";
import { Select, MenuItem } from "@mui/material";
import { StyledFormControl } from "./styles/CommissionsStyles";

/**
 * StatusSelect Component
 * Dropdown for selecting commission status
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected status value
 * @param {Function} props.onChange - Handler called when status selection changes
 * @param {Function} props.t - Translation function for i18n
 * @returns {React.ReactElement} A styled select dropdown for commission status
 */
export const StatusSelect = ({ value, onChange, t }) => {
  // Normalize the value to match available options
  const normalizedValue = value?.toLowerCase?.() || "";

  return (
    <StyledFormControl size="small">
      <Select
        value={normalizedValue}
        onChange={(e) => {
          // Ensure consistent case when changing status
          onChange({
            ...e,
            target: { ...e.target, value: e.target.value.toLowerCase() },
          });
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              "& .MuiMenuItem-root": {
                fontSize: "0.65rem",
                minHeight: "24px",
                padding: "4px 8px",
              },
            },
          },
        }}
      >
        <MenuItem value="payable">{t("payable")}</MenuItem>
        <MenuItem value="not payable">{t("notPayable")}</MenuItem>
        <MenuItem value="pending">{t("pending")}</MenuItem>
      </Select>
    </StyledFormControl>
  );
};

// Default export for convenient importing
export default StatusSelect;
