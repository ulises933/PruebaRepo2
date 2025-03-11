import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Container,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthSSO } from "../context/AuthContextSSO";
import { useLanguage } from "../context/LanguageContext";
import appConfig from "../config/appConfig";
import { styled } from "@mui/material/styles";
import Navbar from "./Navbar";

/**
 * Layout provides a common navigation bar and wraps the page content.
 * This also includes a language switcher and logout functionality.
 */
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  overflow: "hidden",
  position: "relative",
}));

function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { language, switchLanguage, t } = useLanguage();
  const { logoutSSO, ssoUser, isSSOAuthenticated } = useAuthSSO();

  function handleLogout() {
    logout();
    navigate("/");
  }
  function handleLogoutSSO() {
    logoutSSO();
  }

  // Handle language switch for future translations
  function handleLanguageChange(event) {
    switchLanguage(event.target.value);
  }

  return (
    <PageContainer>
      <Navbar />
      <MainContent>{children}</MainContent>
    </PageContainer>
  );
}

export default Layout;
