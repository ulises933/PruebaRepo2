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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  FormControlLabel
} from '@mui/material'
import Layout from '../components/Layout'
import { getInvoices, saveInvoiceChanges, generateMonthlyCut } from '../services/invoiceService'
import { useLanguage } from '../context/LanguageContext'

/**
 * CommissionsSummary displays invoices (facturas) and allows changing a "Payable" status.
 * We have replaced "comisionable" (boolean) with a dropdown: "Payable", "Not payable", "Pending".
 * This page also shows each invoice's articles with commission percentage and amount.
 */
function CommissionsSummary() {
  // Main invoice data from backend
  const [invoices, setInvoices] = useState([])
  // Filtered set of invoices, updated on filter changes
  const [filteredInvoices, setFilteredInvoices] = useState([])

  // Filter states
  const [period, setPeriod] = useState('')
  const [seller, setSeller] = useState('')
  const [invoiceStatus, setInvoiceStatus] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const { t } = useLanguage()

  // Load invoices on mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  // Re-filter whenever the invoice list or filter states change
  useEffect(() => {
    filterInvoices()
  }, [invoices, period, seller, invoiceStatus])

  /**
   * TECHNICAL: Fetch invoice data from the backend.
   * BUSINESS: Each invoice may include multiple articles, each with a potential commission percentage and amount.
   */
  async function fetchInvoices() {
    try {
      const data = await getInvoices()

      // Convert the existing "comisionable" boolean to a "payableStatus" string
      const enriched = data.map((inv) => {
        let payableStatus = 'Not payable'
        if (inv.comisionable) {
          payableStatus = 'Payable'
        }
        // We can leave "Pending" as an option the user might set.

        // Enrich or mock the commission data if not provided
        const enrichedArticles = (inv.articulos || []).map((art) => ({
          ...art,
          // If the backend doesn't provide these fields yet, we can mock them:
          porcentajeComision: art.porcentajeComision ?? 5,   // example 5%
          cantidadComision: art.cantidadComision ?? 0.0      // example $0.00
        }))

        return {
          ...inv,
          payableStatus,
          articulos: enrichedArticles
        }
      })
      setInvoices(enriched)
    } catch {
      // If there's an error, handle it gracefully
      setInvoices([])
    }
  }

  /**
   * TECHNICAL: Filter the invoices by selected period, seller, and status.
   * BUSINESS: This allows the user to quickly find relevant invoices.
   */
  function filterInvoices() {
    let data = [...invoices]
    if (period) {
      data = data.filter((inv) => inv.fecha.includes(period))
    }
    if (seller) {
      data = data.filter((inv) => inv.vendedor.toLowerCase().includes(seller.toLowerCase()))
    }
    if (invoiceStatus) {
      data = data.filter((inv) => inv.estado.toLowerCase() === invoiceStatus)
    }
    setFilteredInvoices(data)
    setPage(1)
  }

  /**
   * When the user changes the dropdown for an invoice, update the "payableStatus" property.
   */
  function handlePayableChange(invoiceId, newValue) {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return { ...inv, payableStatus: newValue }
      }
      return inv
    })
    setInvoices(updated)
  }

  /**
   * TECHNICAL: Convert "payableStatus" string back to boolean "comisionable" for the backend.
   * BUSINESS: The backend only knows true/false, so "Pending" will also be treated as false.
   */
  async function handleSaveChanges() {
    try {
      const changes = invoices.map((inv) => {
        let isComisionable = false
        if (inv.payableStatus === 'Payable') {
          isComisionable = true
        }
        // "Pending" and "Not payable" remain false
        return {
          id: inv.id,
          comisionable: isComisionable
        }
      })
      await saveInvoiceChanges(changes)
      alert('Changes saved successfully')
    } catch {
      alert('Error saving changes')
    }
  }

  /**
   * TECHNICAL: Notify the backend to generate the monthly cut of commissions.
   * BUSINESS: This is typically done once a month, marking a new cycle in the commission tracking process.
   */
  async function handleGenerateCut() {
    try {
      await generateMonthlyCut()
      alert('Monthly cut generated')
    } catch {
      alert('Error generating monthly cut')
    }
  }

  // Calculate pagination indexes
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginated = filteredInvoices.slice(startIndex, endIndex)
  const pageCount = Math.ceil(filteredInvoices.length / rowsPerPage)

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        {t('commissionsTitle')}
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label={t('periodFilter')}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{ minWidth: 140 }}
          />
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>{t('sellerFilter')}</InputLabel>
            <Select
              value={seller}
              label={t('sellerFilter')}
              onChange={(e) => setSeller(e.target.value)}
            >
              <MenuItem value="">{t('pendingPayable') /* "All" in a real i18n approach */}</MenuItem>
              {[...new Set(invoices.map((inv) => inv.vendedor))].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>{t('statusFilter')}</InputLabel>
            <Select
              value={invoiceStatus}
              label={t('statusFilter')}
              onChange={(e) => setInvoiceStatus(e.target.value)}
            >
              <MenuItem value="">{t('pendingPayable') /* "All" placeholder */}</MenuItem>
              <MenuItem value="pendiente">{t('pending')}</MenuItem>
              <MenuItem value="pagado">{t('paid')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
            <TableRow>
              <TableCell>{t('invoiceId')}</TableCell>
              <TableCell>{t('sellerName')}</TableCell>
              <TableCell>{t('invoiceNumber')}</TableCell>
              <TableCell>{t('invoiceDate')}</TableCell>
              <TableCell>{t('totalAmount')}</TableCell>
              <TableCell>{t('articles')}</TableCell>
              <TableCell>{t('currentStatus')}</TableCell>
              <TableCell>{t('payStatus')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.vendedor}</TableCell>
                <TableCell>{inv.id}</TableCell>
                <TableCell>{inv.fecha}</TableCell>
                <TableCell>{inv.importe}</TableCell>
                {/* Commissionable Articles with Commission Percentage & Amount */}
                <TableCell>
                  {(inv.articulos && inv.articulos.length > 0) ? (
                    inv.articulos.map((art, idx) => (
                      <Box key={idx} sx={{ mb: 1, borderBottom: '1px solid #ccc', pb: 1 }}>
                        <Box><strong>Material:</strong> {art.material}</Box>
                        <Box><strong>Description:</strong> {art.descripcion}</Box>
                        <Box><strong>Commission %:</strong> {art.porcentajeComision}%</Box>
                        <Box><strong>Commission Amount:</strong> ${art.cantidadComision}</Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ color: '#999' }}>No articles</Box>
                  )}
                </TableCell>
                <TableCell>{inv.estado}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel>{t('payStatus')}</InputLabel>
                    <Select
                      label={t('payStatus')}
                      value={inv.payableStatus}
                      onChange={(e) => handlePayableChange(inv.id, e.target.value)}
                    >
                      <MenuItem value="Payable">{t('payable')}</MenuItem>
                      <MenuItem value="Not payable">{t('notPayable')}</MenuItem>
                      <MenuItem value="Pending">{t('pendingPayable')}</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions & Pagination */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <Button
          variant="contained"
          onClick={handleSaveChanges}
          sx={{ backgroundColor: '#F15A2B', fontWeight: 'bold' }}
        >
          {t('saveChanges')}
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerateCut}
          sx={{ backgroundColor: '#F15A2B', fontWeight: 'bold' }}
        >
          {t('generateMonthlyCut')}
        </Button>
      </Stack>
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

export default CommissionsSummary
