import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack
} from '@mui/material'
import Layout from '../components/Layout'
import { getPayments } from '../services/paymentService'
import { useLanguage } from '../context/LanguageContext'

/**
 * PaymentsControl shows a list of payments from the backend.
 * It includes filters by seller, payment date, and payment status, along with pagination.
 */
function PaymentsControl() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])

  // Filters
  const [sellerFilter, setSellerFilter] = useState('')
  const [paymentDateFilter, setPaymentDateFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const { t } = useLanguage()

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, sellerFilter, paymentDateFilter, paymentStatusFilter])

  /**
   * TECHNICAL: Calls the backend to retrieve a list of payments (pagos).
   * BUSINESS: Each payment is associated with an invoice and includes status info.
   */
  async function fetchPayments() {
    try {
      const data = await getPayments()
      setPayments(data)
    } catch (error) {
      setPayments([])
    }
  }

  /**
   * Filters the list of payments by seller name, payment date, and payment status.
   */
  function filterPayments() {
    let data = [...payments]
    if (sellerFilter) {
      data = data.filter((p) =>
        p.vendedor.toLowerCase().includes(sellerFilter.toLowerCase())
      )
    }
    if (paymentDateFilter) {
      data = data.filter((p) => p.fechaPago.includes(paymentDateFilter))
    }
    if (paymentStatusFilter) {
      data = data.filter((p) => p.estadoPago.toLowerCase() === paymentStatusFilter)
    }
    setFilteredPayments(data)
    setPage(1)
  }

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginated = filteredPayments.slice(startIndex, endIndex)
  const pageCount = Math.ceil(filteredPayments.length / rowsPerPage)

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        {t('paymentsTitle')}
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>{t('sellerFilter')}</InputLabel>
            <Select
              value={sellerFilter}
              label={t('sellerFilter')}
              onChange={(e) => setSellerFilter(e.target.value)}
            >
              <MenuItem value="">{/* "All" in a real scenario */}</MenuItem>
              {[...new Set(payments.map((p) => p.vendedor))].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={t('paymentDate')}
            value={paymentDateFilter}
            onChange={(e) => setPaymentDateFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>{t('paymentState')}</InputLabel>
            <Select
              value={paymentStatusFilter}
              label={t('paymentState')}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <MenuItem value="">{/* "All" placeholder */}</MenuItem>
              <MenuItem value="pendiente">{t('pending')}</MenuItem>
              <MenuItem value="pagado">{t('paid')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
            <TableRow>
              <TableCell>{t('paymentId')}</TableCell>
              <TableCell>{t('sellerName')}</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Generation Date</TableCell>
              <TableCell>{t('paymentState')}</TableCell>
              <TableCell>Payment Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((p) => (
              <TableRow key={p.idFacturaSap}>
                <TableCell>{p.idFacturaSap}</TableCell>
                <TableCell>{p.vendedor}</TableCell>
                <TableCell>{p.monto}</TableCell>
                <TableCell>{p.fechaGeneracion}</TableCell>
                <TableCell>{p.estadoPago}</TableCell>
                <TableCell>{p.fechaPago ? p.fechaPago : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack alignItems="center" mt={2}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Stack>
    </Layout>
  )
}

export default PaymentsControl
