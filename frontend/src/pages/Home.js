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
  Checkbox,
  Pagination,
  Stack
} from '@mui/material'
import Layout from '../components/Layout'
import { getFacturas, saveChanges, generarCorte } from '../services/invoiceService'

function Home() {
  const [facturas, setFacturas] = useState([])
  const [filteredFacturas, setFilteredFacturas] = useState([])
  const [periodo, setPeriodo] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage] = useState(5)

  useEffect(() => {
    fetchFacturas()
  }, [])

  useEffect(() => {
    filtrarFacturas()
  }, [facturas, periodo, vendedor, estado])

  async function fetchFacturas() {
    try {
      const data = await getFacturas()
      setFacturas(data)
    } catch {
      setFacturas([])
    }
  }

  function filtrarFacturas() {
    let data = [...facturas]
    if (periodo) {
      data = data.filter((f) => f.fecha.includes(periodo))
    }
    if (vendedor) {
      data = data.filter((f) => f.vendedor.toLowerCase().includes(vendedor.toLowerCase()))
    }
    if (estado) {
      data = data.filter((f) => f.estado.toLowerCase() === estado)
    }
    setFilteredFacturas(data)
    setPage(1)
  }

  function handleCheckboxChange(id) {
    const updated = facturas.map((f) => {
      if (f.id === id) {
        return { ...f, comisionable: !f.comisionable }
      }
      return f
    })
    setFacturas(updated)
  }

  async function handleGuardarCambios() {
    try {
      const cambios = facturas.map((f) => ({
        id: f.id,
        comisionable: f.comisionable
      }))
      await saveChanges(cambios)
      alert('Cambios guardados correctamente')
    } catch {
      alert('Error al guardar los cambios')
    }
  }

  async function handleGenerarCorte() {
    try {
      await generarCorte()
      alert('Corte mensual generado')
    } catch {
      alert('Error al generar el corte')
    }
  }

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedFacturas = filteredFacturas.slice(startIndex, endIndex)
  const pageCount = Math.ceil(filteredFacturas.length / rowsPerPage)

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        Resumen de comisiones
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Período (AAAA-MM)"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            sx={{ minWidth: 140 }}
          />
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Vendedor</InputLabel>
            <Select
              value={vendedor}
              label="Vendedor"
              onChange={(e) => setVendedor(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...new Set(facturas.map((f) => f.vendedor))].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              label="Estado"
              onChange={(e) => setEstado(e.target.value)}
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
              <TableCell>ID Vendedor</TableCell>
              <TableCell>Nombre Vendedor</TableCell>
              <TableCell>Número de factura</TableCell>
              <TableCell>Fecha de factura</TableCell>
              <TableCell>Importe total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Comisionable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFacturas.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.vendedor}</TableCell>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.fecha}</TableCell>
                <TableCell>{f.importe}</TableCell>
                <TableCell>{f.estado}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={f.comisionable}
                    onChange={() => handleCheckboxChange(f.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
        <Button
          variant="contained"
          onClick={handleGuardarCambios}
          sx={{ backgroundColor: '#F15A2B', fontWeight: 'bold' }}
        >
          Guardar Cambios
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerarCorte}
          sx={{ backgroundColor: '#F15A2B', fontWeight: 'bold' }}
        >
          Generar Corte Mensual
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

export default Home
