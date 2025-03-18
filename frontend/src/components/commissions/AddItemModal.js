import React from "react";
import { DialogTitle, DialogActions, TextField } from "@mui/material";
import {
  StyledDialog,
  StyledDialogContent,
  StyledFormControl,
  DialogButton,
  buttonStyles,
} from "./styles/CommissionsConfigStyles";

const AddItemModal = ({
  open,
  onClose,
  onAdd,
  itemData,
  onItemDataChange,
  t,
}) => {
  const handleChange = (field) => (event) => {
    onItemDataChange({
      ...itemData,
      [field]: event.target.value,
    });
  };

  const isValid = itemData.sku && itemData.name;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "0.85rem" }}>{t("add_item")}</DialogTitle>
      <StyledDialogContent>
        <StyledFormControl fullWidth>
          <TextField
            value={itemData.sku || ""}
            onChange={handleChange("sku")}
            size="small"
            label={t("sku")}
            sx={{
              fontSize: "0.65rem",
              marginBottom: 2,
            }}
          />
          <TextField
            value={itemData.name || ""}
            onChange={handleChange("name")}
            size="small"
            label={t("item_name")}
            sx={{
              fontSize: "0.65rem",
              marginBottom: 2,
            }}
          />
          <TextField
            value={itemData.commission || ""}
            onChange={handleChange("commission")}
            size="small"
            type="number"
            label={t("commission_percent")}
            InputProps={{
              endAdornment: <span>%</span>,
              inputProps: {
                step: "0.01",
                min: "0",
              },
            }}
            sx={{
              fontSize: "0.65rem",
            }}
          />
        </StyledFormControl>
      </StyledDialogContent>
      <DialogActions sx={{ padding: "8px 16px" }}>
        <DialogButton onClick={onClose}>{t("cancel")}</DialogButton>
        <DialogButton
          onClick={onAdd}
          variant="contained"
          sx={buttonStyles}
          disabled={!isValid}
        >
          {t("add")}
        </DialogButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddItemModal;
