import React from "react";
import {
  DialogTitle,
  DialogActions,
  Autocomplete,
  TextField,
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

  const handleChange = (event, newValue) => {
    onSelectChange({
      target: { value: newValue?.personnel_number || "" },
    });
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "0.85rem" }}>{t("add_partner")}</DialogTitle>
      <StyledDialogContent>
        <StyledFormControl fullWidth>
          <Autocomplete
            value={
              availablePartners.find(
                (p) => p.personnel_number === selectedId
              ) || null
            }
            onChange={handleChange}
            options={availablePartners}
            getOptionLabel={(option) =>
              `${option.full_name} (${option.personnel_number})`
            }
            noOptionsText={t("no_partners_to_add")}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder={t("select_partner")}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "0.75rem",
                    padding: "2px 4px",
                  },
                  "& .MuiAutocomplete-input": {
                    padding: "4px 6px !important",
                  },
                }}
              />
            )}
            ListboxProps={{
              style: {
                fontSize: "0.75rem",
                maxHeight: "250px",
              },
            }}
            renderOption={(props, option) => (
              <li
                {...props}
                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
              >
                {option.full_name}
                <span
                  style={{
                    color: "gray",
                    marginLeft: "8px",
                    fontSize: "0.7rem",
                  }}
                >
                  ({option.personnel_number})
                </span>
              </li>
            )}
          />
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
