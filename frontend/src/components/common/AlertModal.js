import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

/**
 * AlertModal Component
 * A reusable modal dialog component for displaying alerts and confirmations
 *
 * @param {boolean} open - Controls whether the modal is displayed
 * @param {Function} onClose - Handler called when modal is closed
 * @param {string} title - Title text shown in modal header
 * @param {string} message - Main message content of the modal
 * @param {string} severity - Severity level affecting colors ('error' or 'info')
 * @param {string} confirmLabel - Text for the confirm button
 * @param {Function} onConfirm - Handler for confirm button click, defaults to onClose
 */
export const AlertModal = ({
  open,
  onClose,
  title,
  message,
  severity = "info",
  confirmLabel = "OK",
  onConfirm = onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{ color: severity === "error" ? "error.main" : "primary.main" }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === "error" ? "error" : "primary"}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
