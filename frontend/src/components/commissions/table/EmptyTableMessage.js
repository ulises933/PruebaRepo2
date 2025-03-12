import React from "react";
import { TableRow } from "@mui/material";
import { StyledTableCell } from "../styles/CommissionsConfigStyles";

const EmptyTableMessage = ({ colSpan, message }) => (
  <TableRow>
    <StyledTableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
      {message}
    </StyledTableCell>
  </TableRow>
);

export default EmptyTableMessage;
