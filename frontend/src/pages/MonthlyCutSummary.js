import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material'
import Layout from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useCommissionsByPartner } from "../hooks/useCommissionsByPartner"
import { StyledAlert } from "../components/commissions/styles/CommissionsStyles";

/**
 * MonthlyCutSummary:
 *  - Fetches invoice/factura data for the specified period (year/month).
 *  - Aggregates total commission per vendor.
 *  - Displays a table: vendor -> total commission.
 */
function MonthlyCutSummary() {
  // We might pass the year/month in the URL (e.g., "/monthly-cut/2025/1")
  // so let's read them with useParams:
  const { year, month } = useParams()
  const customer_price_group = "08"
  const {
    totals,
    isLoading,
    error,
  } = useCommissionsByPartner(year, month, customer_price_group);
  

  // For user navigation
  const navigate = useNavigate()
  // For language translations (if desired)
  const { t } = useLanguage()


  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        Monthly Cut Summary ({year}-{month})
      </Typography>
      {error && (
        <StyledAlert severity="error">
          {t("errorLoadingCommissions")}
        </StyledAlert>
      )}

      {isLoading && (
        <StyledAlert severity="info">{t("loadingCommissions")}</StyledAlert>
      )}
      {totals && !!totals.length && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
              <TableRow>
                <TableCell>{t("personnel_number")}</TableCell>
                <TableCell>{t("full_name")}</TableCell>
                <TableCell>{t("totalCommission")}</TableCell>
                <TableCell>{t("total_penalty")}</TableCell>
                <TableCell>{t("net_commission")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {totals.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.personnel_number}</TableCell>
                  <TableCell>{row.full_name}</TableCell>
                  <TableCell>{row.total_commission.toFixed(2)}</TableCell>
                  <TableCell>{row.total_penalty.toFixed(2)}</TableCell>
                  <TableCell>{row.net_commission.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Button to go back, if desired */}
      <Box mt={2}>
        <Button
          variant="contained"
          onClick={() => navigate('/commissions-summary')}
        >
          Back to Commissions
        </Button>
      </Box>
    </Layout>
  )
}

export default MonthlyCutSummary
