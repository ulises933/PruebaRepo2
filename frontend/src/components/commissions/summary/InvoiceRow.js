import React from "react";
import { TableRow, TextField } from "@mui/material";
import { StyledTableCell } from "../styles/CommissionsStyles";
import { StatusSelect } from "./StatusSelect";

export const InvoiceRow = React.memo(
  ({ inv, onStatusChange, onPenaltyChange, t }) => {
    return (
      <TableRow>
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
            onChange={(e) => onPenaltyChange(inv.id, e.target.value)}
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
            onChange={(e) => onStatusChange(inv.id, e.target.value)}
            t={t}
          />
        </StyledTableCell>
      </TableRow>
    );
  }
);
