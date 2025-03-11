import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import {
  StyledTableContainer,
  SectionTitle,
  ArticleSection,
  StyledDivider,
  CompactTable,
  StyledTableCell,
} from "./styles/CommissionsStyles";
import { styled } from "@mui/material/styles";

/**
 * ArticleDetails Component
 * Displays detailed information about commission articles in a table format
 *
 * @param {Object} props
 * @param {Array<Object>} props.articles - Array of article data objects where each object contains material codes as keys
 * @param {Function} props.t - Translation function for internationalization
 * @returns {JSX.Element} A table displaying article details or a "no articles" message
 */
const NoArticlesMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(1),
  textAlign: "center",
  fontSize: "0.875rem",
}));

export const ArticleDetails = ({ articles, t }) => {
  if (!articles || articles.length === 0) {
    return <NoArticlesMessage>{t("noArticles")}</NoArticlesMessage>;
  }

  return (
    <ArticleSection>
      <SectionTitle variant="subtitle2" sx={{ padding: 0.5 }}>
        {t("articles")}
      </SectionTitle>
      <StyledTableContainer elevation={0}>
        <CompactTable size="small" aria-label="articles table">
          <TableHead>
            <TableRow>
              <StyledTableCell
                className="header cell-material-code"
                align="center"
              >
                {t("materialCode")}
              </StyledTableCell>
              <StyledTableCell className="header cell-amount" align="center">
                {t("amount")}
              </StyledTableCell>
              <StyledTableCell
                className="header cell-commission"
                align="center"
              >
                {t("commission")}
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((art) =>
              Object.entries(art).map(([code, details]) => (
                <TableRow key={code} hover>
                  <TableCell align="center">{code}</TableCell>
                  <TableCell align="center">
                    ${details?.importe?.toFixed(2) ?? "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    ${details?.comision?.toFixed(2) ?? "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </CompactTable>
      </StyledTableContainer>
    </ArticleSection>
  );
};

export default ArticleDetails;
