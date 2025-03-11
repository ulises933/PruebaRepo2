import { styled } from "@mui/material/styles";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#002B3B",
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  minHeight: "48px",
  padding: theme.spacing(0, 2),
}));

export const NavSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

export const NavButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  fontSize: {
    xs: "0.8rem",
    sm: "0.9rem",
  },
}));

export const UserInfo = styled(Typography)(({ theme }) => ({
  color: "#fff",
  fontSize: {
    xs: "0.8rem",
    sm: "0.9rem",
  },
}));

export const commonStyles = {
  select: {
    color: "#fff",
    fontSize: { xs: "0.8rem", sm: "0.9rem" },
    "& .MuiSelect-icon": {
      color: "#fff",
    },
    "&:before, &:after": {
      borderColor: "#fff",
    },
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },
  brandText: {
    fontWeight: "bold",
    fontSize: { xs: "0.9rem", sm: "1rem" },
  },
};
