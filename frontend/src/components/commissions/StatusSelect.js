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
export const StatusSelect = ({ value, onChange, t }) => (
  <StyledFormControl size="small">
    <Select
      value={value}
      onChange={onChange}
      MenuProps={{
        PaperProps: {
          sx: {
            "& .MuiMenuItem-root": {
              fontSize: "0.65rem", // Match font size with other components
              minHeight: "24px", // Compact menu items
              padding: "4px 8px", // Consistent padding
            },
          },
        },
      }}
    >
      <MenuItem value="pagable">{t("payable")}</MenuItem>
      <MenuItem value="no pagable">{t("notPayable")}</MenuItem>
      <MenuItem value="pendiente">{t("pending")}</MenuItem>
    </Select>
  </StyledFormControl>
);

// Default export for convenient importing
export default StatusSelect;
