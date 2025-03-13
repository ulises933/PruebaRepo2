import React, { useEffect } from "react";
import { Alert, Slide, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledAlert = styled(Alert)(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(7),
  right: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
  minWidth: "200px",
  maxWidth: "400px",
  boxShadow: theme.shadows[3],
  transition: "opacity 0.3s ease-in-out",
  opacity: 1,
  "& .MuiAlert-message": {
    fontSize: "0.85rem",
  },
}));

const NotificationContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(7),
  right: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
}));

const NOTIFICATION_TIMEOUT = 5000; // 5 seconds

const Notification = ({ open, message, severity, onClose }) => {
  useEffect(() => {
    let timer;
    if (open) {
      timer = setTimeout(() => {
        onClose();
      }, NOTIFICATION_TIMEOUT);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [open, onClose]);

  return (
    <NotificationContainer>
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <StyledAlert
          severity={severity}
          onClose={onClose}
          sx={{
            animation: open ? "fadeIn 0.3s ease-in" : "fadeOut 0.3s ease-out",
          }}
        >
          {message}
        </StyledAlert>
      </Slide>
    </NotificationContainer>
  );
};

export default Notification;
