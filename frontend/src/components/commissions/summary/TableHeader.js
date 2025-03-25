import React from "react";
import { TableHead, TableRow } from "@mui/material";
import { StyledTableCell } from "../styles/CommissionsStyles";

export const TableHeader = React.memo(({ t }) => (
  <TableHead>
    <TableRow>
      <StyledTableCell className="header text-center cell-id">
        {t("invoiceId")} (DB)
      </StyledTableCell>
      <StyledTableCell className="header text-center cell-doc">
        {t("billingDocument")}
      </StyledTableCell>
      <StyledTableCell className="header text-center cell-amount">
        {t("totalAmount")}
      </StyledTableCell>
      <StyledTableCell className="header text-center cell-commission">
        {t("totalCommission")}
      </StyledTableCell>
      <StyledTableCell className="header text-center cell-penalty">
        {t("penalty")}
      </StyledTableCell>
      <StyledTableCell className="header cell-status text-center">
        {t("currentStatus")}
      </StyledTableCell>
    </TableRow>
  </TableHead>
));
