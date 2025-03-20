/**
 * AddGroupItemModal Component
 * Modal for adding item groups with level 1 and level 2 group selection and commission configuration
 *
 * @param {boolean} open - Controls modal visibility
 * @param {Function} onClose - Handler for closing the modal
 * @param {Function} onAdd - Handler for adding a new item group
 * @param {Function} t - Translation function
 * @param {string} customerPriceGroup - Selected customer price group
 */
import React, { useState, useEffect } from "react";
import {
  DialogTitle,
  DialogActions,
  Autocomplete,
  TextField,
  Box,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
} from "@mui/material";
import {
  StyledDialog,
  StyledDialogContent,
  DialogButton,
  buttonStyles,
  StyledFormControl,
} from "./styles/CommissionsConfigStyles";
import { commissionConfigService } from "../../services/commissionConfigService";

const AddGroupItemModal = ({ open, onClose, onAdd, t, customerPriceGroup }) => {
  // State for storing groups, selections and loading state
  const [level1Groups, setLevel1Groups] = useState([]);
  const [level2Groups, setLevel2Groups] = useState([]);
  const [selectedLevel1, setSelectedLevel1] = useState(null);
  const [selectedLevel2, setSelectedLevel2] = useState(null);
  const [commission, setCommission] = useState("0.00");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch level 1 groups on mount and when customer price group changes
  useEffect(() => {
    const fetchLevel1Groups = async () => {
      try {
        const groups = await commissionConfigService.getItemGroups(
          1,
          customerPriceGroup
        );
        setLevel1Groups(groups);
      } catch (error) {
        console.error("Error fetching level 1 groups:", error);
      }
    };
    fetchLevel1Groups();
  }, [customerPriceGroup]);

  // Fetch level 2 groups on mount and when customer price group changes
  useEffect(() => {
    const fetchLevel2Groups = async () => {
      try {
        const groups = await commissionConfigService.getItemGroups(
          2,
          customerPriceGroup
        );
        setLevel2Groups(groups);
      } catch (error) {
        console.error("Error fetching level 2 groups:", error);
      }
    };
    fetchLevel2Groups();
  }, [customerPriceGroup]);

  // Fetch items when level 1 or level 2 selection changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedLevel1 && !selectedLevel2) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedItems = await commissionConfigService.getItems(
          selectedLevel1?.id || "",
          selectedLevel2?.id || ""
        );
        setItems(fetchedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
      setLoading(false);
    };

    fetchItems();
  }, [selectedLevel1, selectedLevel2]);

  /**
   * Handles change in level 1 group selection
   * Resets level 2 selection when level 1 changes
   */
  const handleLevel1Change = (event, newValue) => {
    setSelectedLevel1(newValue);
    setSelectedLevel2(null);
  };

  /**
   * Handles change in level 2 group selection
   */
  const handleLevel2Change = (event, newValue) => {
    setSelectedLevel2(newValue);
  };

  /**
   * Handles adding new item group configuration
   * Validates that at least one level is selected
   */
  const handleAdd = () => {
    if (!selectedLevel1 && !selectedLevel2) return;

    onAdd({
      group1: selectedLevel1?.id || "",
      group1_description: selectedLevel1?.name || "",
      group2: selectedLevel2?.id || "",
      group2_description: selectedLevel2?.name || "",
      commission_percent: commission,
      customer_price_group: customerPriceGroup,
    });
    handleClose();
  };

  /**
   * Resets modal state and closes it
   */
  const handleClose = () => {
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setCommission("0.00");
    setItems([]);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("add_item_group")}</DialogTitle>
      <StyledDialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Level 1 Group Selection */}
          <StyledFormControl fullWidth>
            <InputLabel sx={{ mb: 1 }}>{t("level1_group")}</InputLabel>
            <Autocomplete
              value={selectedLevel1}
              onChange={handleLevel1Change}
              options={level1Groups}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t("search_level1")}
                  size="small"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: "0.875rem" }}>
                  {option.name}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
            />
          </StyledFormControl>

          {/* Level 2 Group Selection */}
          <StyledFormControl fullWidth>
            <InputLabel sx={{ mb: 1 }}>{t("level2_group")}</InputLabel>
            <Autocomplete
              value={selectedLevel2}
              onChange={handleLevel2Change}
              options={level2Groups}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t("search_level2")}
                  size="small"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: "0.875rem" }}>
                  {option.name}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              disabled={!selectedLevel1}
            />
          </StyledFormControl>

          {/* Commission Input */}
          {(selectedLevel1 || selectedLevel2) && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t("commission_percent")}
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                InputProps={{
                  endAdornment: <span>%</span>,
                  inputProps: { step: "0.01", min: "0" },
                }}
                size="small"
              />
            </Box>
          )}

          {/* Items List */}
          {(selectedLevel1 || selectedLevel2) && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                >
                  {t("items_in_group")}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
                  {items.length} {t("items")}
                </Typography>
              </Box>
              {loading ? (
                <Typography variant="caption">{t("loading")}</Typography>
              ) : items.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ maxHeight: 300, overflow: "auto" }}
                >
                  <List dense>
                    {items.map((item) => (
                      <ListItem
                        key={item.name}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                          py: 0.75,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ fontSize: "0.6rem" }}
                            >
                              {item.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Typography variant="caption" color="textSecondary">
                  {t("no_items_found")}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </StyledDialogContent>
      <DialogActions>
        <DialogButton onClick={handleClose}>{t("cancel")}</DialogButton>
        <DialogButton
          onClick={handleAdd}
          variant="contained"
          sx={buttonStyles}
          disabled={!selectedLevel1 && !selectedLevel2}
        >
          {t("add")}
        </DialogButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default AddGroupItemModal;
