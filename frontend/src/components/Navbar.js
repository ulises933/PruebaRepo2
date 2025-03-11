import React from "react";
import { Box, FormControl, Select, MenuItem, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthSSO } from "../context/AuthContextSSO";
import { useLanguage } from "../context/LanguageContext";
import {
  StyledAppBar,
  StyledToolbar,
  NavSection,
  NavButton,
  UserInfo,
  commonStyles,
} from "./styles/NavbarStyles";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { language, switchLanguage, t } = useLanguage();
  const { logoutSSO, ssoUser, isSSOAuthenticated } = useAuthSSO();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogoutSSO = async () => {
    logoutSSO();
  };

  const handleLanguageChange = (event) => {
    switchLanguage(event.target.value);
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar variant="dense">
        {/* Brand and Navigation */}
        <NavSection>
          <Typography variant="subtitle1" sx={commonStyles.brandText}>
            DEACERO
          </Typography>
          <NavButton component={Link} to="/commissions-summary" size="small">
            {t("navCommissionsSummary")}
          </NavButton>
          <NavButton component={Link} to="/payments-control" size="small">
            {t("navPaymentsControl")}
          </NavButton>
        </NavSection>

        {/* Language and User Controls */}
        <NavSection>
          <FormControl variant="standard" size="small">
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={commonStyles.select}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="es">ES</MenuItem>
            </Select>
          </FormControl>

          {isSSOAuthenticated ? (
            <Box sx={commonStyles.userBox}>
              <UserInfo>{ssoUser?.name || ssoUser?.username}</UserInfo>
              <NavButton onClick={handleLogoutSSO} size="small">
                {t("logout")}
              </NavButton>
            </Box>
          ) : (
            <NavButton onClick={handleLogout} size="small">
              {t("logout")}
            </NavButton>
          )}
        </NavSection>
      </StyledToolbar>
    </StyledAppBar>
  );
}

export default Navbar;
