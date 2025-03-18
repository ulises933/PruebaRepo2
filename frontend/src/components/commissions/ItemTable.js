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

const itemColumns = [
  {
    id: "sku",
    label: "sku",
    widths: { xs: "30%", sm: "25%", md: "20%" },
  },
  {
    id: "name",
    label: "item_name",
    widths: { xs: "40%", sm: "45%", md: "50%" },
  },
  {
    id: "commission",
    label: "commission_percent",
    widths: { xs: "30%", sm: "30%", md: "30%" },
  },
  {
    id: "actions",
    label: "actions",
    widths: { xs: "10%", sm: "10%", md: "10%" },
  },
];

const ItemTable = ({
  items,
  onItemChange,
  onDeleteItem,
  t,
  editingItem,
  onStartEdit,
  onFinishEdit,
}) => {
  return (
    <TableWrapper>
      <StyledTableContainer>
        <Table size="small" stickyHeader>
          <TableHeader columns={itemColumns} t={t} />
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow
                  key={item.sku}
                  onDoubleClick={() => onStartEdit("item", item.sku)}
                >
                  <StyledTableCell>{item.sku}</StyledTableCell>
                  <StyledTableCell>{item.name}</StyledTableCell>
                  <EditableCell
                    value={item.commission}
                    onChange={(e) => onItemChange(index, e.target.value)}
                    isEditing={editingItem === item.sku}
                    onBlur={() => onFinishEdit("item")}
                    suffix="%"
                  />
                  <DeleteButton onClick={() => onDeleteItem(item.sku)} t={t} />
                </TableRow>
              ))
            ) : (
              <EmptyTableMessage colSpan={4} message={t("no_items_found")} />
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </TableWrapper>
  );
};

export default ItemTable;
