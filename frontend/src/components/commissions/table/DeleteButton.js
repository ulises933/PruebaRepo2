import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { StyledTableCell } from "../styles/CommissionsConfigStyles";

const DeleteButton = ({ onClick, t }) => (
  <StyledTableCell align="center">
    <Tooltip title={t("delete")} placement="top">
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          color: "error.main",
          padding: "4px",
          "&:hover": {
            backgroundColor: "error.lighter",
          },
        }}
      >
        <DeleteIcon sx={{ fontSize: "1rem" }} />
      </IconButton>
    </Tooltip>
  </StyledTableCell>
);

export default DeleteButton;
