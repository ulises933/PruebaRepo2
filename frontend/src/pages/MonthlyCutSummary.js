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
import { getCommissionsSummary } from '../services/commissionsService'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

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

  // Aggregated data structure: [{ vendor: string, totalCommission: number }, ...]
  const [totals, setTotals] = useState([])

  // For user navigation
  const navigate = useNavigate()
  // For language translations (if desired)
  const { t } = useLanguage()

  useEffect(() => {
    if (year && month) {
      fetchData(parseInt(year), parseInt(month))
    }
    // eslint-disable-next-line
  }, [year, month])

  /**
   * Fetches fresh invoice data for the given period
   * and aggregates the total commission per vendor.
   */
  async function fetchData(yr, mo) {
    try {
      // Retrieve all invoice records from your real backend
      const invoices = await getCommissionsSummary({
        year: yr,
        month: mo,
        personnel_number: '0',
        customer_price_group: '',
        language: 'EN'
      })

      // Example aggregator: sum "importe_comision" by vendor
      // In your DB model, vendor might be identified by "personnel_number"
      // or you might store the name in "articulos" or "detalle_comision".
      // This example just uses a "personnel_number" as the "vendor" grouping.
      const vendorMap = {}

      invoices.forEach((inv) => {
        // Ensure we have a numeric commission
        const commission = inv.importe_comision ?? 0
        const vendorKey = inv.personnel_number || 'Unknown'

        if (!vendorMap[vendorKey]) {
          vendorMap[vendorKey] = 0
        }
        vendorMap[vendorKey] += commission
      })

      // Convert to a simple array
      const arr = Object.entries(vendorMap).map(([vendor, totalCommission]) => ({
        vendor,
        totalCommission
      }))

      setTotals(arr)
    } catch (error) {
      console.error(error)
      alert('Error fetching monthly cut data')
    }
  }

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        Monthly Cut Summary ({year}-{month})
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Total Commission</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {totals.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.vendor}</TableCell>
                <TableCell>{row.totalCommission.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
