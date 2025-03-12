import React from "react";
import {
  DialogTitle,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  StyledDialog,
  StyledDialogContent,
  StyledFormControl,
  DialogButton,
  buttonStyles,
} from "./styles/CommissionsConfigStyles";

const AddPartnerModal = ({
  open,
  onClose,
  onAdd,
  selectedId,
  onSelectChange,
  partners,
  addedIds,
  t,
}) => {
  const availablePartners =
    partners?.filter(
      (partner) => !addedIds.includes(partner.personnel_number)
    ) || [];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "0.85rem" }}>{t("add_partner")}</DialogTitle>
      <StyledDialogContent>
        <StyledFormControl fullWidth>
          <Select
            value={selectedId}
            onChange={onSelectChange}
            size="small"
            displayEmpty
            sx={{
              fontSize: "0.65rem",
              "& .MuiSelect-select": {
                padding: "6px 8px",
              },
            }}
          >
            <MenuItem value="" disabled sx={{ fontSize: "0.65rem" }}>
              {availablePartners.length > 0
                ? t("select_partner")
                : t("no_partners_to_add")}
            </MenuItem>
            {availablePartners.map((partner) => (
              <MenuItem
                key={partner.personnel_number}
                value={partner.personnel_number}
                sx={{ fontSize: "0.65rem", minHeight: "32px" }}
              >
                {partner.full_name}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
      </StyledDialogContent>
      <DialogActions sx={{ padding: "8px 16px" }}>
        <DialogButton onClick={onClose}>{t("cancel")}</DialogButton>
        <DialogButton
          onClick={onAdd}
          variant="contained"
          sx={buttonStyles}
          disabled={!selectedId || availablePartners.length === 0}
        >
          {t("add")}
        </DialogButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddPartnerModal;
