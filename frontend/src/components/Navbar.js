import React, { useState } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Menu,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthSSO } from "../context/AuthContextSSO";
import { useLanguage } from "../context/LanguageContext";
import MenuIcon from "@mui/icons-material/Menu";
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
  const location = useLocation();
  const { language, switchLanguage, t } = useLanguage();
  const { logoutSSO, ssoUser, isSSOAuthenticated } = useAuthSSO();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

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

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navLinks = [
    { to: "/commissions-summary", label: "navCommissionsSummary" },
    { to: "/payments-control", label: "navPaymentsControl" },
    { to: "/commissions-config", label: "navCommissionsConfig" },
  ];

  return (
    <StyledAppBar position="static">
      <StyledToolbar variant="dense">
        {/* Brand and Navigation */}
        <NavSection>
          <Typography variant="subtitle1" sx={commonStyles.brandText}>
            DEACERO
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {navLinks.map((link) => (
              <NavButton
                key={link.to}
                component={Link}
                to={link.to}
                size="small"
                sx={{
                  borderBottom:
                    location.pathname === link.to
                      ? "2px solid #F15A2B"
                      : "none",
                }}
              >
                {t(link.label)}
              </NavButton>
            ))}
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            sx={{ display: { xs: "flex", md: "none" }, ml: 1 }}
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Navigation Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {navLinks.map((link) => (
              <MenuItem
                key={link.to}
                component={Link}
                to={link.to}
                onClick={handleMobileMenuClose}
                sx={{
                  color: location.pathname === link.to ? "#F15A2B" : "inherit",
                  fontSize: "0.875rem",
                }}
              >
                {t(link.label)}
              </MenuItem>
            ))}
          </Menu>
        </NavSection>

        {/* Language and User Controls */}
        <NavSection>
          {isSSOAuthenticated ? (
            <Box sx={commonStyles.userBox}>
              <UserInfo
                sx={{
                  fontSize: "0.75rem",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {ssoUser?.name || ssoUser?.username}
              </UserInfo>
              <FormControl variant="standard" size="small">
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  sx={{
                    ...commonStyles.select,
                    fontSize: "0.75rem",
                    minWidth: { xs: "30px", sm: "30px" },
                  }}
                >
                  <MenuItem value="en">🇺🇸</MenuItem>
                  <MenuItem value="es">🇲🇽</MenuItem>
                </Select>
              </FormControl>
              <NavButton
                onClick={handleLogoutSSO}
                size="small"
                sx={{
                  minWidth: { xs: "60px", sm: "auto" },
                }}
              >
                {t("logout")}
              </NavButton>
            </Box>
          ) : (
            <NavButton
              onClick={handleLogout}
              size="small"
              sx={{
                minWidth: { xs: "60px", sm: "auto" },
              }}
            >
              {t("logout")}
            </NavButton>
          )}
        </NavSection>
      </StyledToolbar>
    </StyledAppBar>
  );
}

export default Navbar;
