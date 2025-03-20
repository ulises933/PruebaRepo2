import React from "react";
import {
  StyledTableCell,
  StyledTextField,
} from "../styles/CommissionsConfigStyles";

/**
 * EditableCell Component
 * Renders an editable table cell with a text field for numeric input
 *
 * @param {string|number} value - The current value of the cell
 * @param {Function} onChange - Handler called when the value changes
 * @param {Function} onBlur - Optional handler called when the field loses focus
 * @param {string} type - Input type, defaults to "number"
 * @param {string} suffix - Optional suffix to display after the value (e.g. "%")
 * @returns {JSX.Element} A table cell containing an editable text field
 */
const EditableCell = ({
  value,
  onChange,
  onBlur,
  type = "number",
  suffix = "",
}) => (
  <StyledTableCell>
    <StyledTextField
      type={type}
      value={value ?? ""} // Use empty string if value is null/undefined
      onChange={onChange}
      size="small"
      inputProps={{
        step: "0.01", // Allow two decimal places
        min: "0", // Prevent negative numbers
      }}
      InputProps={{
        endAdornment: <span>{suffix}</span>, // Display suffix after value
      }}
      onBlur={(e) => {
        // Format number to 2 decimal places when field loses focus
        if (e.target.value) {
          const formattedValue = Number(e.target.value).toFixed(2);
          e.target.value = formattedValue;
          onChange({
            target: { value: formattedValue },
          });
        }
        // Call parent onBlur handler if provided
        onBlur && onBlur(e);
      }}
    />
  </StyledTableCell>
);

export default EditableCell;
