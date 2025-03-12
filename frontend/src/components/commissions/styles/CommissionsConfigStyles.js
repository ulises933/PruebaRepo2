// Import required components from Material UI
import { styled } from "@mui/material/styles";
import {
  Box,
  TableContainer,
  TableCell,
  Paper,
  FormControl,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";

// Page title styling
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  fontSize: "1rem",
}));

// Table container styling with sticky headers
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  height: "100%",
  "& .MuiTable-root": {
    minWidth: 650,
    [theme.breakpoints.down("sm")]: {
      minWidth: 450,
    },
  },
  "& .MuiTableCell-root": {
    padding: theme.spacing(0.5, 1),
    fontSize: "0.75rem",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5),
      fontSize: "0.65rem",
    },
  },
  "& .MuiTableCell-head": {
    fontWeight: "bold",
    backgroundColor: "#F8FAFC",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  "& .MuiTableRow-root": {
    padding: "8px 0",
    margin: "4px 0",
    "&:nth-of-type(odd)": {
      backgroundColor: "#F8FAFC",
    },
    "&:hover": {
      backgroundColor: "#EDF2F7",
    },
  },
}));

// Custom table cell styling
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "6px 8px",
  fontSize: "0.75rem",
  "&.header": {
    backgroundColor: "#F8FAFC",
    fontWeight: "bold",
  },
  "&.text-center": {
    textAlign: "center",
  },
}));

// Main content wrapper styling
export const ContentWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  display: "flex",
  flexDirection: "column",
  marginBottom: theme.spacing(8),
  height: "calc(100vh - 150px)",
  [theme.breakpoints.down("sm")]: {
    height: "calc(100vh - 180px)",
    marginBottom: theme.spacing(10),
  },
}));

// Filter section styling at the top of tables
export const FilterSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  backgroundColor: "#F8FAFC",
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  gap: theme.spacing(2),
  flexShrink: 0,
  minHeight: "72px",
  borderBottom: "1px solid #E2E8F0",
  position: "sticky",
  top: 0,
  zIndex: 2,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
    minHeight: "auto",
  },
}));

// Form control styling for select inputs
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
  "& .MuiInputBase-root": {
    height: "32px",
    fontSize: "0.75rem",
  },
  "& .MuiSelect-select": {
    padding: "6px 8px",
    fontSize: "0.75rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.75rem",
    transform: "translate(14px, -6px) scale(0.75)",
    backgroundColor: "#fff",
    padding: "0 4px",
  },
}));

// Text field styling
export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: "24px",
    width: "130px",
    fontSize: "0.75rem",
  },
  "& .MuiOutlinedInput-input": {
    padding: "6px 12px",
  },
  "& .MuiInputAdornment-root": {
    marginRight: "8px",
  },
  "& .MuiInputBase-input::placeholder": {
    fontSize: "0.65rem",
  },
}));

// Action button styling
export const ActionButton = styled(Button)(({ theme }) => ({
  height: "32px",
  fontSize: "0.75rem",
  textTransform: "none",
  padding: "6px 16px",
}));

// Common button styles with brand color
export const buttonStyles = {
  backgroundColor: "#F15A2B",
  fontWeight: "bold",
  fontSize: "0.75rem",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#d14d24",
  },
};

// Pagination wrapper styling
export const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

// Fixed bottom actions container
export const BottomActionsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  backgroundColor: "#fff",
  boxShadow: "0px -2px 4px rgba(0, 0, 0, 0.05)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  "& .MuiPagination-root": {
    [theme.breakpoints.down("sm")]: {
      order: -1,
    },
  },
}));

// Filter label styling
export const FilterLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.65rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(0.5),
  position: "absolute",
  top: "-18px",
  left: "0",
}));

// Dialog styling
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "400px",
  },
  "& .MuiDialogTitle-root": {
    padding: "12px 16px",
    fontSize: "0.85rem",
  },
  "& .MuiDialogContent-root": {
    padding: "8px 16px",
  },
  "& .MuiDialogActions-root": {
    padding: "8px 16px",
  },
}));

// Dialog content styling
export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  "& .MuiFormControl-root": {
    marginTop: theme.spacing(1),
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.65rem",
  },
  "& .MuiSelect-select": {
    fontSize: "0.65rem",
    padding: "6px 8px",
  },
  "& .MuiMenuItem-root": {
    fontSize: "0.65rem",
    minHeight: "32px",
  },
}));

// Dialog button styling
export const DialogButton = styled(Button)(({ theme }) => ({
  fontSize: "0.65rem",
  padding: "4px 8px",
  minWidth: "64px",
  textTransform: "none",
}));

// Search field styling
export const SearchField = styled(TextField)(({ theme }) => ({
  minWidth: "280px",
  [theme.breakpoints.down("sm")]: {
    minWidth: "100%",
  },
  "& .MuiInputBase-root": {
    height: "32px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.65rem",
    transform: "translate(14px, -6px) scale(0.75)",
    backgroundColor: "#fff",
    padding: "0 4px",
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -6px) scale(0.75)",
  },
  "& .MuiOutlinedInput-input": {
    padding: "6px 8px 6px 12px",
  },
  "& .MuiInputBase-input::placeholder": {
    fontSize: "0.75rem",
  },
  "& .MuiInputAdornment-root": {
    marginRight: "8px",
    "& .MuiSvgIcon-root": {
      fontSize: "18px",
      color: theme.palette.text.secondary,
    },
  },
}));

// Filter group container styling
export const FilterGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  flex: 1,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: theme.spacing(1.5),
    width: "100%",
  },
}));

// Table wrapper styling with fixed layout
export const TableWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  height: "calc(100vh - 215px)",
  [theme.breakpoints.down("sm")]: {
    height: "calc(100vh - 280px)",
  },
}));

// Column width definitions for tables
export const columnWidths = {
  agent: "35%",
  personnel: "15%",
  commission: "25%",
  penalty: "25%",
  sku: "20%",
  itemName: "50%",
  itemCommission: "30%",
};

// Container for form controls with labels
export const LabeledControl = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "inline-flex",
  flexDirection: "column",
}));
