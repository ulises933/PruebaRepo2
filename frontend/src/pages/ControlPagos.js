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
import { getPagos } from '../services/paymentService'

function ControlPagos() {
  const [pagos, setPagos] = useState([])
  const [filteredPagos, setFilteredPagos] = useState([])
  const [vendedorFilter, setVendedorFilter] = useState('')
  const [fechaPagoFilter, setFechaPagoFilter] = useState('')
  const [estadoPagoFilter, setEstadoPagoFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(5)

  useEffect(() => {
    fetchPagos()
  }, [])

  useEffect(() => {
    filtrarPagos()
  }, [pagos, vendedorFilter, fechaPagoFilter, estadoPagoFilter])

  async function fetchPagos() {
    try {
      const data = await getPagos()
      setPagos(data)
    } catch (error) {
      setPagos([])
    }
  }

  function filtrarPagos() {
    let data = [...pagos]
    if (vendedorFilter) {
      data = data.filter((p) =>
        p.vendedor.toLowerCase().includes(vendedorFilter.toLowerCase())
      )
    }
    if (fechaPagoFilter) {
      data = data.filter((p) => p.fechaPago.includes(fechaPagoFilter))
    }
    if (estadoPagoFilter) {
      data = data.filter((p) => p.estadoPago.toLowerCase() === estadoPagoFilter)
    }
    setFilteredPagos(data)
    setPage(1)
  }

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedPagos = filteredPagos.slice(startIndex, endIndex)
  const pageCount = Math.ceil(filteredPagos.length / rowsPerPage)

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        Control de pagos
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Vendedor</InputLabel>
            <Select
              value={vendedorFilter}
              label="Vendedor"
              onChange={(e) => setVendedorFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...new Set(pagos.map((p) => p.vendedor))].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Fecha de pago (AAAA-MM-DD)"
            value={fechaPagoFilter}
            onChange={(e) => setFechaPagoFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          />

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Estado de pago</InputLabel>
            <Select
              value={estadoPagoFilter}
              label="Estado de pago"
              onChange={(e) => setEstadoPagoFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="pagado">Pagado</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
            <TableRow>
              <TableCell>ID Factura SAP</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha de generación</TableCell>
              <TableCell>Estado de pago</TableCell>
              <TableCell>Fecha de pago</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPagos.map((p) => (
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

export default ControlPagos
