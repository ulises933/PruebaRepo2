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

const partnerColumns = [
  {
    id: "full_name",
    label: "partner",
    widths: { xs: "40%", sm: "35%", md: "35%" },
  },
  {
    id: "personnel_number",
    label: "personnel_number",
    widths: { xs: "20%", sm: "15%", md: "15%" },
  },
  {
    id: "commission",
    label: "commission_percent",
    widths: { xs: "20%", sm: "25%", md: "25%" },
  },
  {
    id: "penalty",
    label: "penalty",
    widths: { xs: "20%", sm: "25%", md: "25%" },
  },
];

const PartnerTable = ({
  partners,
  onPartnerChange,
  t,
  formatter,
  editingPartner,
  onStartEdit,
  onFinishEdit,
}) => {
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
                  <StyledTableCell>{partner.full_name}</StyledTableCell>
                  <StyledTableCell>{partner.personnel_number}</StyledTableCell>
                  <EditableCell
                    value={partner.commission}
                    onChange={(e) =>
                      onPartnerChange(index, "commission", e.target.value)
                    }
                    isEditing={editingPartner === partner.personnel_number}
                    onBlur={() => onFinishEdit("partner")}
                    suffix="%"
                  />
                  <EditableCell
                    value={partner.penalty}
                    onChange={(e) =>
                      onPartnerChange(index, "penalty", e.target.value)
                    }
                    isEditing={editingPartner === partner.personnel_number}
                    onBlur={() => onFinishEdit("partner")}
                    suffix="MXN"
                  />
                </TableRow>
              ))
            ) : (
              <EmptyTableMessage colSpan={4} message={t("no_partners_found")} />
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
};

export default PartnerTable;
