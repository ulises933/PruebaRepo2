import { styled } from "@mui/material/styles";
import {
  Box,
  Accordion,
  TableContainer,
  FormControl,
  Typography,
  Paper,
  Divider,
  Table,
  TableCell,
  Stack,
  Alert,
} from "@mui/material";

// Page title
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  marginBottom: theme.spacing(1.5),
  fontWeight: 600,
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: theme.zIndex.appBar - 1,
  paddingTop: theme.spacing(1),
}));

// Alert styles
export const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  "& .MuiAlert-message": {
    fontSize: "0.85rem",
  },
}));

// Filter section styles
export const FilterBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.75),
  position: "sticky",
  top: "48px",
  backgroundColor: "#F8FAFC",
  zIndex: theme.zIndex.appBar - 1,
  padding: theme.spacing(0.75),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: `0 1px 2px ${theme.palette.grey[200]}`,
  "& .MuiFormControl-root": {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      minWidth: "unset",
    },
    [theme.breakpoints.up("sm")]: {
      minWidth: "80px",
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.grey[700],
    fontSize: "0.6rem",
    transform: "translate(6px, 4px)",
    "&.MuiInputLabel-shrink": {
      transform: "translate(6px, -6px) scale(0.75)",
    },
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#FFFFFF",
    height: "26px",
    "& input": {
      padding: "2px 6px",
      fontSize: "0.6rem",
    },
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.light,
      },
    },
  },
  "& .MuiSelect-select": {
    padding: "2px 6px !important",
    fontSize: "0.6rem",
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": {
    fontSize: "0.8rem",
  },
}));

// Accordion styles
export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  boxShadow: "none",
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: "4px",
  "&:before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    minHeight: "26px",
    padding: theme.spacing(0, 0.35),
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    "&.Mui-expanded": {
      minHeight: "26px",
      borderBottom: `1px solid ${theme.palette.grey[200]}`,
    },
    "& .MuiAccordionSummary-content": {
      margin: 0,
      "&.Mui-expanded": {
        margin: 0,
      },
    },
    "& .MuiTypography-root": {
      fontWeight: 600,
      fontSize: "0.75rem",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
      color: theme.palette.text.secondary,
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: theme.spacing(0.15),
    paddingTop: 0,
    backgroundColor: theme.palette.background.paper,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    "& .MuiAccordionSummary-root": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  "&.Mui-expanded": {
    margin: theme.spacing(0.1, 0),
  },
}));

// Table styles
export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(0.15),
  "& .MuiTableCell-head": {
    fontWeight: 600,
    whiteSpace: "nowrap",
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(0.1, 0.35),
    fontSize: "0.65rem",
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  "& .MuiTableCell-body": {
    whiteSpace: "nowrap",
    padding: theme.spacing(0.1, 0.35),
    fontSize: "0.65rem",
    borderBottom: "none",
  },
  "& .MuiTableRow-root": {
    height: "26px",
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[50],
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// Table cell styles
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(0.1, 0.35),
  fontSize: "0.65rem",
  height: "26px",
  borderBottom: "none",
  "&.header": {
    backgroundColor: theme.palette.grey[200],
    fontWeight: 600,
  },
  "&.text-right": {
    textAlign: "right",
  },
  "&.text-center": {
    textAlign: "center",
  },
  "&.cell-id": {
    width: "120px",
  },
  "&.cell-doc": {
    width: "180px",
  },
  "&.cell-status": {
    width: "180px",
  },
  "&.cell-amount": {
    width: "140px",
  },
  "&.cell-commission": {
    width: "140px",
  },
  "&.cell-actions": {
    width: "100px",
  },
  "&.cell-material-code": {
    width: "180px",
  },
  "& .MuiSelect-select": {
    fontSize: "0.65rem",
    minHeight: "unset !important",
  },
  "& .MuiSelect-icon": {
    fontSize: "1rem",
    right: "2px",
  },
}));

// Content container
export const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0, // Important for flex child
  overflow: "auto",
  marginBottom: theme.spacing(8), // Space for fixed bottom bar
}));

// Bottom actions container
export const BottomActionsContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  zIndex: theme.zIndex.appBar,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

// Pagination styles
export const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  "& .MuiPagination-ul": {
    fontSize: "0.75rem",
  },
}));

// Action buttons styles
export const ActionButtonsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  "& .MuiButton-root": {
    padding: theme.spacing(0.5, 1.5),
    fontSize: "0.75rem",
    minWidth: "120px",
  },
}));

// Field width constants
export const fieldWidths = {
  yearMonth: "150px",
  seller: "400px",
  status: "150px",
};

// Article details styles
export const ArticleSection = styled(Box)(({ theme }) => ({
  "& .MuiDivider-root": {
    margin: theme.spacing(0.25, 0),
  },
  "& .MuiTypography-root": {
    fontSize: "0.65rem",
  },
  "& .MuiTableCell-root": {
    padding: theme.spacing(0.1, 0.35),
    borderBottom: "none",
  },
  "& .MuiTableRow-root": {
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[50],
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1.5, 0),
}));

// Add new grid layout helper
export const GridLayout = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(1.5),
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  width: "100%",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  },
}));

// Compact table styles
export const CompactTable = styled(Table)(({ theme }) => ({
  "& .MuiTableCell-root": {
    padding: theme.spacing(0.1, 0.35),
    fontSize: "0.65rem",
    borderBottom: "none",
  },
  "& .MuiTableCell-head": {
    fontWeight: 600,
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  "& .MuiTableRow-root": {
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.grey[50],
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// Common styles
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.85rem",
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "&::after": {
    content: '""',
    flex: 1,
    height: 1,
    backgroundColor: theme.palette.divider,
  },
}));

// Status select styles
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 110,
  "& .MuiSelect-select": {
    fontSize: "0.6rem",
    padding: "2px 6px",
    height: "20px",
    lineHeight: "20px",
    backgroundColor: "white",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.6rem",
    transform: "translate(6px, 4px)",
    "&.MuiInputLabel-shrink": {
      transform: "translate(6px, -6px) scale(0.75)",
    },
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

// Button styles
export const buttonStyles = {
  backgroundColor: "#F15A2B",
  fontWeight: "bold",
};
