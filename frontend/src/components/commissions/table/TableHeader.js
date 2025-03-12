import React from "react";
import { TableHead, TableRow } from "@mui/material";
import { StyledTableCell } from "../styles/CommissionsConfigStyles";

const TableHeader = ({ columns, t }) => (
  <TableHead>
    <TableRow>
      {columns.map((column) => (
        <StyledTableCell
          key={column.id}
          className="header"
          sx={(theme) => ({
            width: {
              xs: column.widths.xs,
              sm: column.widths.sm,
              md: column.widths.md,
            },
          })}
        >
          {t(column.label)}
        </StyledTableCell>
      ))}
    </TableRow>
  </TableHead>
);

export default TableHeader;
