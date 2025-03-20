/**
 * @fileoverview Partner Table Component for displaying and managing partner commission configurations
 */

import React from "react";
import { Table, TableBody, TableRow } from "@mui/material";
import {
  StyledTableContainer,
  StyledTableCell,
  TableWrapper,
} from "./styles/CommissionsConfigStyles";
import TableHeader from "./table/TableHeader";
import EditableCell from "./table/EditableCell";
import EmptyTableMessage from "./table/EmptyTableMessage";
import DeleteButton from "./table/DeleteButton";

/**
 * Column definitions for the partner table
 * Each column has an id, label and responsive width settings
 */
const partnerColumns = [
  {
    id: "id",
    label: "id",
    widths: { xs: "10%", sm: "10%", md: "10%" },
  },
  {
    id: "personnel_number",
    label: "personnel_number",
    widths: { xs: "15%", sm: "15%", md: "15%" },
  },
  {
    id: "full_name",
    label: "partner",
    widths: { xs: "20%", sm: "20%", md: "20%" },
  },
  {
    id: "commission_percent",
    label: "commission_percent",
    widths: { xs: "15%", sm: "15%", md: "15%" },
  },
  {
    id: "fixed_fee",
    label: "fixed_fee",
    widths: { xs: "15%", sm: "15%", md: "15%" },
  },
  {
    id: "date_created",
    label: "date_created",
    widths: { xs: "15%", sm: "15%", md: "15%" },
  },
  {
    id: "actions",
    label: "actions",
    widths: { xs: "10%", sm: "10%", md: "10%" },
  },
];

/**
 * PartnerTable Component
 * Displays a table of partners with editable commission percentages and fixed fees
 *
 * @param {Array} partners - Array of partner objects to display
 * @param {Function} onPartnerChange - Handler for updating partner values
 * @param {Function} onDeletePartner - Handler for deleting a partner
 * @param {Function} t - Translation function
 * @param {string|null} editingPartner - ID of partner currently being edited
 * @param {Function} onStartEdit - Handler for starting edit mode
 * @param {Function} onFinishEdit - Handler for finishing edit mode
 */
const PartnerTable = ({
  partners,
  onPartnerChange,
  onDeletePartner,
  t,
  editingPartner,
  onStartEdit,
  onFinishEdit,
}) => {
  /**
   * Formats a date string to localized format
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date string or empty string if invalid
   */
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TableWrapper>
      <StyledTableContainer>
        <Table size="small" stickyHeader>
          <TableHeader columns={partnerColumns} t={t} />
          <TableBody>
            {partners.length > 0 ? (
              partners.map((partner, index) => (
                <TableRow
                  key={partner.personnel_number}
                  onDoubleClick={() =>
                    onStartEdit("partner", partner.personnel_number)
                  }
                >
                  <StyledTableCell>{partner.id || "-"}</StyledTableCell>
                  <StyledTableCell>{partner.personnel_number}</StyledTableCell>
                  <StyledTableCell>{partner.full_name}</StyledTableCell>
                  <EditableCell
                    value={partner.commission_percent ?? "0.00"}
                    onChange={(e) =>
                      onPartnerChange(
                        index,
                        "commission_percent",
                        e.target.value
                      )
                    }
                    isEditing={editingPartner === partner.personnel_number}
                    onBlur={() => onFinishEdit("partner")}
                    suffix="%"
                  />
                  <EditableCell
                    value={partner.fixed_fee ?? "0.00"}
                    onChange={(e) =>
                      onPartnerChange(index, "fixed_fee", e.target.value)
                    }
                    isEditing={editingPartner === partner.personnel_number}
                    onBlur={() => onFinishEdit("partner")}
                    suffix="MXN"
                  />
                  <StyledTableCell>
                    {formatDate(partner.date_created) || "-"}
                  </StyledTableCell>
                  <DeleteButton
                    onClick={() => onDeletePartner(partner.personnel_number)}
                    t={t}
                  />
                </TableRow>
              ))
            ) : (
              <EmptyTableMessage colSpan={7} message={t("no_partners_found")} />
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
};

export default PartnerTable;
