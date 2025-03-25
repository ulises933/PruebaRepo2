/**
 * AddPartnerModal Component
 * Modal for adding new partners with commission configuration
 *
 * @param {boolean} open - Controls modal visibility
 * @param {Function} onClose - Handler for closing the modal
 * @param {Function} onAdd - Handler for adding a new partner
 * @param {string} selectedId - Currently selected partner ID
 * @param {Function} onSelectChange - Handler for partner selection change
 * @param {Array} partners - List of all available partners
 * @param {Array} addedIds - List of already added partner IDs
 * @param {Function} t - Translation function
 */
import React, { useState } from "react";
import {
  DialogTitle,
  DialogActions,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useAuthSSO } from "../../context/AuthContextSSO";
import {
  StyledDialog,
  StyledDialogContent,
  StyledFormControl,
  DialogButton,
  buttonStyles,
} from "./styles/CommissionsConfigStyles";
import { createPartnerConfig } from "../../services/commissionConfigService";

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
  const { ssoUser } = useAuthSSO();
  // Form state for partner data
  const [formData, setFormData] = useState({
    personnel_number: "",
    commission_percent: "0.00",
    fixed_fee: "0.00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out already added partners
  const availablePartners =
    partners?.filter(
      (partner) => !addedIds.includes(partner.personnel_number)
    ) || [];

  /**
   * Handles partner selection change in autocomplete
   * Updates form data and triggers parent callback
   */
  const handleChange = (event, newValue) => {
    setFormData({
      ...formData,
      personnel_number: newValue?.personnel_number || "",
    });
    onSelectChange({
      target: { value: newValue?.personnel_number || "" },
    });
  };

  /**
   * Handles changes to numeric input fields
   * Validates input is empty or non-negative number
   */
  const handleNumberChange = (field) => (event) => {
    const value = event.target.value;
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  /**
   * Handles adding a new partner
   * Creates partner config and triggers parent callback on success
   */
  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      const selectedPartner = partners.find(
        (p) => p.personnel_number === selectedId
      );

      if (!selectedPartner) {
        throw new Error("Partner not found");
      }

      const partnerData = {
        personnel_number: selectedId,
        full_name: selectedPartner.full_name,
        commission_percent: parseFloat(formData.commission_percent) || 0,
        fixed_fee: parseFloat(formData.fixed_fee) || 0,
        customer_price_group: "08",
      };

      await createPartnerConfig(partnerData, ssoUser?.username);

      onAdd({
        ...partnerData,
        commission_percent: formData.commission_percent,
        fixed_fee: formData.fixed_fee,
      });

      // Reset form
      setFormData({
        personnel_number: "",
        commission_percent: "0.00",
        fixed_fee: "0.00",
      });
    } catch (error) {
      console.error("Failed to create partner config:", error);
      // You might want to show an error notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles closing the modal
   * Resets form data to initial state
   */
  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      personnel_number: "",
      commission_percent: "0.00",
      fixed_fee: "0.00",
    });
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "0.85rem" }}>{t("add_partner")}</DialogTitle>
      <StyledDialogContent>
        {/* Partner selection autocomplete */}
        <StyledFormControl fullWidth sx={{ mb: 2 }}>
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
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <li
                  key={option.personnel_number}
                  {...otherProps}
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
              );
            }}
          />
        </StyledFormControl>

        {/* Commission percentage input */}
        <StyledFormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            value={formData.commission_percent}
            onChange={handleNumberChange("commission_percent")}
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
            sx={{ fontSize: "0.75rem" }}
          />
        </StyledFormControl>

        {/* Fixed fee input */}
        <StyledFormControl fullWidth>
          <TextField
            value={formData.fixed_fee}
            onChange={handleNumberChange("fixed_fee")}
            size="small"
            type="number"
            label={t("fixed_fee")}
            InputProps={{
              endAdornment: <span>MXN</span>,
              inputProps: {
                step: "0.01",
                min: "0",
              },
            }}
            sx={{ fontSize: "0.75rem" }}
          />
        </StyledFormControl>
      </StyledDialogContent>
      <DialogActions sx={{ padding: "8px 16px" }}>
        <DialogButton onClick={handleClose} disabled={isSubmitting}>
          {t("cancel")}
        </DialogButton>
        <DialogButton
          onClick={handleAdd}
          variant="contained"
          sx={buttonStyles}
          disabled={
            !selectedId || availablePartners.length === 0 || isSubmitting
          }
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            t("add")
          )}
        </DialogButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddPartnerModal;
