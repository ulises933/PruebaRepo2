import React from "react";
import {
  StyledTableCell,
  StyledTextField,
} from "../styles/CommissionsConfigStyles";

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
      value={value}
      onChange={onChange}
      size="small"
      inputProps={{
        step: "0.01",
        min: "0",
      }}
      InputProps={{
        endAdornment: <span>{suffix}</span>,
      }}
      onBlur={(e) => {
        if (e.target.value) {
          const formattedValue = Number(e.target.value).toFixed(2);
          e.target.value = formattedValue;
          onChange({
            target: { value: formattedValue },
          });
        }
        onBlur && onBlur(e);
      }}
    />
  </StyledTableCell>
);

export default EditableCell;
