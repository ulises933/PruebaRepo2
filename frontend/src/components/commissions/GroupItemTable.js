/**
 * GroupItemTable Component
 * Displays a table of item groups with editable commission percentages
 *
 * @param {Array} itemGroups - Array of item group objects to display
 * @param {Function} onItemGroupChange - Handler for updating item group values
 * @param {Function} onDeleteItemGroup - Handler for deleting an item group
 * @param {Function} t - Translation function
 * @param {string|null} editingItem - ID of item currently being edited
 * @param {Function} onStartEdit - Handler for starting edit mode
 * @param {Function} onFinishEdit - Handler for finishing edit mode
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

// Column definitions for the table
const itemColumns = [
  {
    id: "id",
    label: "id",
    widths: { xs: "8%", sm: "8%", md: "8%" },
  },
  {
    id: "group1",
    label: "level1_group",
    widths: { xs: "12%", sm: "12%", md: "12%" },
  },
  {
    id: "group1_description",
    label: "level1_description",
    widths: { xs: "15%", sm: "15%", md: "15%" },
  },
  {
    id: "group2",
    label: "level2_group",
    widths: { xs: "12%", sm: "12%", md: "12%" },
  },
  {
    id: "group2_description",
    label: "level2_description",
    widths: { xs: "15%", sm: "15%", md: "15%" },
  },
  {
    id: "commission_percent",
    label: "commission_percent",
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
    widths: { xs: "8%", sm: "8%", md: "8%" },
  },
];

const GroupItemTable = ({
  itemGroups = [],
  onItemGroupChange,
  onDeleteItemGroup,
  t,
  editingItem,
  onStartEdit,
  onFinishEdit,
}) => {
  /**
   * Formats a date string into localized format
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date string or "-" if invalid
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
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
          <TableHeader columns={itemColumns} t={t} />
          <TableBody>
            {itemGroups.length > 0 ? (
              itemGroups.map((group, index) => (
                <TableRow
                  key={group.id || `group-${index}`}
                  onDoubleClick={() => onStartEdit("item", group.id)}
                >
                  <StyledTableCell>{group.id || "-"}</StyledTableCell>
                  <StyledTableCell>{group.group1 || "-"}</StyledTableCell>
                  <StyledTableCell>
                    {group.group1_description || "-"}
                  </StyledTableCell>
                  <StyledTableCell>{group.group2 || "-"}</StyledTableCell>
                  <StyledTableCell>
                    {group.group2_description || "-"}
                  </StyledTableCell>
                  <EditableCell
                    value={group.commission_percent ?? "0.00"}
                    onChange={(e) =>
                      onItemGroupChange(
                        index,
                        "commission_percent",
                        e.target.value
                      )
                    }
                    isEditing={editingItem === group.id}
                    onBlur={() => onFinishEdit("item")}
                    suffix="%"
                  />
                  <StyledTableCell>
                    {formatDate(group.date_created)}
                  </StyledTableCell>
                  <StyledTableCell>
                    <DeleteButton
                      onClick={() => onDeleteItemGroup(group.id)}
                      t={t}
                    />
                  </StyledTableCell>
                </TableRow>
              ))
            ) : (
              <EmptyTableMessage colSpan={8} message={t("no_items_found")} />
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
};

export default GroupItemTable;
