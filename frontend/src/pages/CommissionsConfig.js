import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext'

const allAgents = [
    
    { name: 'Zacarías Flores del Campo', personnel_number:9},
    { name: 'McLovin', personnel_number:5},
    { name: 'Vicente Rorífico', personnel_number:4},
    { name: 'Elena Nito', personnel_number:2},
];

const formatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format;

/**
 * CommissionsConfig allows configuring commission amounts for agents or items.
 */
function CommissionsConfig() {
  const [filter, setFilter] = useState('Agente');
  const [agents, setAgents] = useState([{ name: 'Juanito Calvo Unclávito', personnel_number:8, commission: 5, penalty: 50 }]);
  
  const [items, setItems] = useState([
    { sku: 'SKU001', name: 'Pintura para Ventanas', commission: 8 },
    { sku: 'SKU002', name: 'Varilla Calibre 14', commission: 12 },
    { sku: 'SKU003', name: 'Clavos con Rosca', commission: 10 },
  ]);

  const addedPersonnelNumbers = agents.map(agent => agent.personnel_number);

  const [openModal, setOpenModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const { t } = useLanguage()

  const handleSaveChanges = () => {
    // Logic to save changes goes here
    alert('Changes saved successfully');
  };

  const handleAddAgent = () => {
    const newAgent = allAgents.find(agent => agent.personnel_number === selectedAgentId);
    debugger;
    if (newAgent) {
      setAgents([...agents, {...newAgent, commission: 0, penalty: 0 }]);
      setOpenModal(false);
      setSelectedAgentId('');
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddArticle = () => {
    const newArticle = { sku: `SKU00${items.length + 1}`, name: `Artículo ${items.length + 1}`, commission: 0 };
    setItems([...items, newArticle]);
  };

  return (
    <Layout>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>
        {t("commissions_config")}
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <FormControl sx={{minWidth:180}}>
            <InputLabel>{t("config_type")}</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label={t("config_type")}
            >
              <MenuItem value="Agente">{t('by_agent')}</MenuItem>
              <MenuItem value="Artículo">{t('by_item')}</MenuItem>
            </Select>
          </FormControl>
          {filter === 'Agente' && (
            <Button variant="outlined" onClick={handleOpenModal} sx={{ height: '56px', ml: 2 }}>
              + {t("add_agent")}
            </Button>
          )}
          {filter === 'Artículo' && (
            <Button variant="outlined" onClick={handleAddArticle} sx={{ height: '56px', ml: 2 }}>
              + {t("add_item")}
            </Button>
          )}
        </Box>

        {filter === 'Agente' && (
          
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
                  <TableRow>
                    <TableCell>{t('agent')}</TableCell>
                    <TableCell>{t('personnel_number')}</TableCell>
                    <TableCell>{t('commission_percent')}</TableCell>
                    <TableCell>{t('penalty')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents.map((agent, index) => (
                    <TableRow key={index}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.personnel_number}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={agent.commission}
                          onChange={(e) => {
                            const newAgents = [...agents];
                            newAgents[index].commission = e.target.value;
                            setAgents(newAgents);
                          }}
                          InputProps={{
                            endAdornment: <span>%</span>,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={formatter(agent.penalty)}
                          onChange={(e) => {
                            const newAgents = [...agents];
                            newAgents[index].penalty = e.target.value;
                            setAgents(newAgents);
                          }}
                          InputProps={{
                            endAdornment: <span>MXN</span>,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        )}

        {filter === 'Artículo' && (
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#E0E0E0' }}>
                  <TableRow>
                    <TableCell>{t("sku")}</TableCell>
                    <TableCell>{t("item_name")}</TableCell>
                    <TableCell>{t("commission_percent")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.commission}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].commission = e.target.value;
                            setItems(newItems);
                          }}
                          InputProps={{
                            endAdornment: <span>%</span>,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        )}

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            sx={{ backgroundColor: '#F15A2B', fontWeight: 'bold' }}
          >
            {t('save_changes')}
          </Button>
        </Stack>
      </Paper>

      {/* Modal para agregar agente */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        >
        <DialogTitle>{t("add_agent")}</DialogTitle>
        <DialogContent >          
          <FormControl fullWidth sx={{mt:2}}>
            <InputLabel>{t("select_agent")}</InputLabel>
            <Select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              label={t("select_agent")}
            >
              {allAgents.filter(agent => !addedPersonnelNumbers.includes(agent.personnel_number)).map(agent => (
                <MenuItem key={agent.personnel_number} value={agent.personnel_number}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleAddAgent}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default CommissionsConfig; 