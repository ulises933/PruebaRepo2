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
  Stack
} from '@mui/material'
import Layout from '../components/Layout'
import { getCommissionsSummary, saveInvoiceStatuses, closeBillingCycle } from '../services/commissionsService'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/**
 * CommissionsSummary page that integrates with the real FastAPI backend:
 *  1) GET /comission_summary (to retrieve invoice data)
 *  2) POST /guardar_cambios (to update statuses)
 *  3) POST /close_billing_cycle (to close the month)
 * 
 * The "estatus" field can be: "pagable", "no pagable", or "pendiente".
 * Each invoice has an "id" (DB ID), "billing_document", "estatus", "id_corte", etc.
 */
function CommissionsSummary() {
  // We might want dynamic year/month in a real scenario,
  // or let the user input them. For now, we fix them.
  const [year, setYear] = useState(2025)
  const [month, setMonth] = useState(1)
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  
  // Additional filters
  const [sellerFilter, setSellerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // For pagination
  const [page, setPage] = useState(1)
  const rowsPerPage = 5
  
  const { user } = useAuth()        // If we have a logged-in user with a name
  const { t } = useLanguage()       // For i18n text

  useEffect(() => {
    // On mount (or if year/month changes), fetch real data from backend
    fetchCommissionsData()
    // eslint-disable-next-line
  }, [year, month])

  useEffect(() => {
    applyFilters()
  }, [invoices, sellerFilter, statusFilter])

  /**
   * BUSINESS: fetch real invoice data from backend for the specified year & month.
   */
  async function fetchCommissionsData() {
    try {
      // Example with default personnel_number, etc.
      const result = await getCommissionsSummary({
        year,
        month,
        personnel_number: '0',
        customer_price_group: '',
        language: 'EN'
      })
      // "result" is an array of FacturaTracking objects
      // Each has "id", "billing_document", "estatus", "articulos", "importe_total", etc.
      setInvoices(result)
    } catch (err) {
      console.error(err)
      setInvoices([])
      alert('Error fetching commissions summary')
    }
  }

  /**
   * TECHNICAL: Filter invoices locally by "seller" or "status".
   * BUSINESS: Allows user to quickly find relevant items.
   */
  function applyFilters() {
    let data = [...invoices]
    if (sellerFilter) {
      data = data.filter((inv) =>
        inv.personnel_number?.toLowerCase().includes(sellerFilter.toLowerCase()) ||
        inv.billing_document?.toLowerCase().includes(sellerFilter.toLowerCase())
      )
    }
    if (statusFilter) {
      data = data.filter((inv) => inv.estatus === statusFilter)
    }
    setFilteredInvoices(data)
    setPage(1)
  }

  /**
   * TECHNICAL: When user selects from dropdown "pagable"/"no pagable"/"pendiente", update the invoice's "estatus" in state.
   */
  function handleStatusChange(invoiceId, newStatus) {
    const updated = invoices.map((inv) => {
      if (inv.id === invoiceId) {
        return { ...inv, estatus: newStatus }
      }
      return inv
    })
    setInvoices(updated)
  }

  /**
   * BUSINESS: Saves the changes by calling POST /guardar_cambios. 
   * We must pass:
   * facturas_modificadas: [{ id, estatus, id_corte }, ...]
   * usuario_modificador
   */
  async function handleSaveChanges() {
    try {
      const payload = invoices.map((inv) => ({
        id: inv.id,
        estatus: inv.estatus,
        id_corte: inv.id_corte
      }))
      
      // Use the current user from AuthContext if available; fallback to "system_user"
      const userName = user?.username || 'system_user'
      
      await saveInvoiceStatuses(payload, userName)
      alert('Changes saved successfully')
    } catch (err) {
      console.error(err)
      alert('Error saving changes')
    }
  }

  /**
   * BUSINESS: Trigger monthly cut by calling POST /close_billing_cycle
   * We pass { year, month, user, personnel_number, ... }
   */
  async function handleGenerateCut() {
    try {
      const userName = user?.username || 'system_user'
      // Example usage
      await closeBillingCycle({
        year,
        month,
        user: userName,
        personnel_number: '0',
        customer_price_group: '',
        language: 'EN'
      })
      alert('Billing cycle closed successfully')
    } catch (err) {
      console.error(err)
      alert('Error closing billing cycle')
    }
  }

  // Pagination calculation
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginated = filteredInvoices.slice(startIndex, endIndex)
  const pageCount = Math.ceil(filteredInvoices.length / rowsPerPage)

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        {t('commissionsTitle')}
      </Typography>

      {/* Example controls to pick year/month or filter by seller, etc. */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          {/* Year Input */}
          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ width: 120 }}
          />
          {/* Month Input */}
          <TextField
            label="Month"
            type="number"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            sx={{ width: 120 }}
          />
          {/* Seller Filter */}
          <TextField
            label={t('sellerFilter')}
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          />
          {/* Status Filter */}
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>{t('statusFilter')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('statusFilter')}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">{/* "All" */}</MenuItem>
              <MenuItem value="pagable">pagable</MenuItem>
              <MenuItem value="no pagable">no pagable</MenuItem>
              <MenuItem value="pendiente">pendiente</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table of Invoices */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
            <TableRow>
              <TableCell>{t('invoiceId')} (DB)</TableCell>
              <TableCell>Billing Document</TableCell>
              <TableCell>{t('currentStatus')}</TableCell>
              <TableCell>Articles</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Actions (Dropdown)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((inv) => (
              <TableRow key={inv.id}>
                {/* DB ID */}
                <TableCell>{inv.id}</TableCell>
                {/* Billing Document */}
                <TableCell>{inv.billing_document}</TableCell>
                {/* Estatus */}
                <TableCell>{inv.estatus}</TableCell>
                {/* Articles (articulos) */}
                <TableCell>
                  {(inv.articulos && inv.articulos.length > 0) ? (
                    inv.articulos.map((art, idx) => (
                      <Box key={idx} sx={{ mb: 1, borderBottom: '1px solid #ccc', pb: 1 }}>
                        <Box><strong>Material:</strong> {art.material}</Box>
                        <Box><strong>Description:</strong> {art.descripcion}</Box>
                        {/* If your backend stores commission %/amount inside each article, show them here */}
                        <Box><strong>Commission %:</strong> {art.porcentajeComision ?? 'N/A'}</Box>
                        <Box><strong>Commission Amount:</strong> {art.cantidadComision ?? 'N/A'}</Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ color: '#999' }}>No articles</Box>
                  )}
                </TableCell>
                {/* Importe Total (if present) */}
                <TableCell>{inv.importe_total ?? 'N/A'}</TableCell>
                {/* Dropdown to change estatus */}
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={inv.estatus}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                    >
                      <MenuItem value="pagable">pagable</MenuItem>
                      <MenuItem value="no pagable">no pagable</MenuItem>
                      <MenuItem value="pendiente">pendiente</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save and Generate Cut Buttons */}
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

      {/* Pagination */}
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
