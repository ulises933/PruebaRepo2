import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useAuthSSO } from "../context/AuthContextSSO";
import { loginApi } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";

/**
 * Login page allows the user to enter credentials.
 * It consumes the /login endpoint from the backend and stores the user session.
 */
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { loginSSO, isSSOAuthenticated } = useAuthSSO();

  // Check if user is already authenticated (either regular or SSO) on component mount
  useEffect(() => {
    if (isAuthenticated || isSSOAuthenticated) {
      navigate("/commissions-summary");
    }
  }, [isAuthenticated, isSSOAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Business: Validate credentials with the backend.
      const data = await loginApi(username, password);
      // If successful, store the user data in the AuthContext.
      login(data);
      // Technical: Navigate to the main page after login.
      navigate("/commissions-summary");
    } catch {
      alert("Invalid credentials");
    }
  }
  /**
   * Handles Single Sign-On (SSO) login attempt using Microsoft Azure AD.
   * On success, redirects to the commissions summary page.
   * On failure, shows an error message to the user.
   *
   * @throws {Error} If SSO authentication fails
   */
  async function handleSSO() {
    try {
      // Attempt SSO login through Azure AD
      await loginSSO();
      // Redirect to main page on success
      navigate("/commissions-summary");
    } catch (error) {
      // Show user-friendly error message if SSO fails
      alert(
        `SSO login failed: ${error.message}. Please try again or contact support if the issue persists.`
      );
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ p: 4, width: 320 }}>
        <Typography
          variant="h5"
          mb={2}
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          {t("loginTitle")}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
        >
          <TextField
            variant="outlined"
            label={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            variant="outlined"
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{ backgroundColor: "#F15A2B", fontWeight: "bold" }}
          >
            {t("loginButton")}
          </Button>
        </Box>
        <Button
          onClick={handleSSO}
          sx={{
            backgroundColor: "#F15A2B",
            color: "white",
            fontWeight: "bold",
            marginTop: "10px",
            width: "100%",
            "&:hover": {
              backgroundColor: "#F15A2B",
            },
          }}
        >
          {t("loginSSO")}
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
