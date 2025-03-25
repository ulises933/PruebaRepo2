import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StyledAccordion } from "../styles/CommissionsStyles";
import { ArticleDetails } from "./ArticleDetails";
import { InvoiceRow } from "./InvoiceRow";

export const InvoiceAccordion = React.memo(
  ({ inv, expanded, onExpand, onStatusChange, onPenaltyChange, t }) => (
    <StyledAccordion expanded={expanded} onChange={onExpand}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <InvoiceRow
                inv={inv}
                onStatusChange={onStatusChange}
                onPenaltyChange={onPenaltyChange}
                t={t}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionSummary>
      <AccordionDetails>
        <ArticleDetails articles={inv.items} t={t} />
      </AccordionDetails>
    </StyledAccordion>
  )
);
