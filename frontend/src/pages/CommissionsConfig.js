import { useState, useEffect, useMemo } from "react";
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
  DialogTitle,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { commissionConfigService } from "../services/commissionConfigService";
import { useAuth } from "../context/AuthContext";
import {
  PageTitle,
  StyledTableContainer,
  StyledTableCell,
  ContentWrapper,
  FilterSection,
  StyledFormControl,
  StyledTextField,
  ActionButton,
  buttonStyles,
  PaginationWrapper,
  BottomActionsContainer,
  FilterLabel,
  StyledDialog,
  StyledDialogContent,
  DialogButton,
  FilterGroup,
  LabeledControl,
  SearchField,
} from "../components/commissions/styles/CommissionsConfigStyles";
import { usePagination } from "../hooks/usePagination";
import PartnerTable from "../components/commissions/PartnerTable";
import ItemTable from "../components/commissions/ItemTable";
import AddPartnerModal from "../components/commissions/AddPartnerModal";
import SearchIcon from "@mui/icons-material/Search";

const allPartners = [
  {
    full_name: "Zacarías Flores del Campo",
    personnel_number: 9,
    commission: 5.5,
    penalty: 1000,
  },
  {
    full_name: "McLovin",
    personnel_number: 5,
    commission: 3.2,
    penalty: 500,
  },
  {
    full_name: "Vicente Rorifico",
    personnel_number: 4,
    commission: 4.0,
    penalty: 750,
  },
  {
    full_name: "Elena Nito",
    personnel_number: 2,
    commission: 6.0,
    penalty: 1200,
  },
  {
    full_name: "Armando Paredes",
    personnel_number: 7,
    commission: 4.5,
    penalty: 800,
  },
  {
    full_name: "Dolores Delano",
    personnel_number: 3,
    commission: 5.0,
    penalty: 900,
  },
  {
    full_name: "Alan Brito",
    personnel_number: 8,
    commission: 3.8,
    penalty: 600,
  },
  {
    full_name: "Elsa Pato",
    personnel_number: 1,
    commission: 4.2,
    penalty: 850,
  },
  {
    full_name: "Mario Neta",
    personnel_number: 6,
    commission: 5.8,
    penalty: 1100,
  },
  {
    full_name: "Aquiles Bailo",
    personnel_number: 10,
    commission: 3.5,
    penalty: 450,
  },
];

const testItems = [
  { sku: "SKU001", name: "Laptop Dell XPS 13", commission: 2.5 },
  { sku: "SKU002", name: "Monitor LG 27'", commission: 1.8 },
  { sku: "SKU003", name: "Teclado Mecánico RGB", commission: 3.0 },
  { sku: "SKU004", name: "Mouse Gaming Logitech", commission: 2.0 },
  { sku: "SKU005", name: "Audífonos Sony WH-1000XM4", commission: 2.2 },
  { sku: "SKU006", name: "iPad Pro 12.9", commission: 1.5 },
  { sku: "SKU007", name: "Samsung Galaxy S21", commission: 2.8 },
  { sku: "SKU008", name: "Impresora HP LaserJet", commission: 1.2 },
  { sku: "SKU009", name: "Webcam Logitech C920", commission: 2.4 },
  { sku: "SKU010", name: "Router ASUS Gaming", commission: 1.9 },
];

/**
 * CommissionsConfig allows configuring commission amounts for partners or items.
 */
function CommissionsConfig() {
  const [filter, setFilter] = useState("Partner");
  const [partners, setPartners] = useState(allPartners);
  const [items, setItems] = useState(testItems);
  const [allAvailablePartners, setAllAvailablePartners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [openModal, setOpenModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const addedPersonnelNumbers = partners.map(
    (partner) => partner.personnel_number
  );

  const ITEMS_PER_PAGE = 19;

  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  const [editingPartner, setEditingPartner] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!itemSearchTerm || !items) return items || [];

    const search = itemSearchTerm.toLowerCase();
    return items.filter(
      (item) =>
        (item?.sku?.toLowerCase() || "").includes(search) ||
        (item?.name?.toLowerCase() || "").includes(search)
    );
  }, [items, itemSearchTerm]);

  // Filter partners based on search term
  const filteredPartners = useMemo(() => {
    if (!partnerSearchTerm || !partners) return partners || [];

    const search = partnerSearchTerm.toLowerCase();
    return partners.filter(
      (partner) =>
        (partner?.full_name?.toLowerCase() || "").includes(search) ||
        partner?.personnel_number?.toString().includes(search)
    );
  }, [partners, partnerSearchTerm]);

  // Fetch partners and their configurations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both partners and configurations
        const [partnersData, configsData] = await Promise.all([
          commissionConfigService.getPartners(),
          commissionConfigService.getPartnerConfigs("DEFAULT"), // Add customer price group parameter
        ]);

        // Store all available partners from API
        setAllAvailablePartners(partnersData);

        // Transform configurations into partners array format
        const partnersWithConfig = partnersData
          .filter((partner) =>
            configsData.some(
              (config) => config.personnel_number === partner.personnel_number
            )
          )
          .map((partner) => {
            const config = configsData.find(
              (c) => c.personnel_number === partner.personnel_number
            );
            return {
              full_name: partner.full_name,
              personnel_number: partner.personnel_number,
              commission: config?.commission || 0,
              penalty: config?.penalty || 0,
            };
          });

        setPartners(partnersWithConfig);
      } catch (err) {
        setError(err.message);
        setAllAvailablePartners([]);
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    //fetchData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const configurations = partners.map((partner) => ({
        personnel_number: partner.personnel_number,
        commission_percentage: parseFloat(partner.commission) || 0,
        penalty_amount: parseFloat(partner.penalty) || 0,
      }));

      await commissionConfigService.updatePartnerConfigs(
        configurations,
        user?.username
      );
      alert(t("changes_saved_successfully"));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = () => {
    const selectedPartner = allAvailablePartners.find(
      (partner) => partner.personnel_number === selectedPartnerId
    );

    if (selectedPartner) {
      setPartners([
        ...partners,
        {
          full_name: selectedPartner.full_name,
          personnel_number: selectedPartnerId,
          commission: 0,
          penalty: 0,
        },
      ]);
      setOpenModal(false);
      setSelectedPartnerId("");
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddArticle = () => {
    const newArticle = {
      sku: `SKU00${items.length + 1}`,
      name: `Item ${items.length + 1}`,
      commission: 0,
    };
    setItems([...items, newArticle]);
  };

  // Update pagination to use filtered partners
  const {
    page,
    setPage,
    paginatedItems: displayedPartners,
    pageCount: partnerPageCount,
  } = usePagination(filteredPartners, 1, ITEMS_PER_PAGE);

  // Update pagination
  const {
    page: itemsPage,
    setPage: setItemsPage,
    paginatedItems: displayedItems,
    pageCount: itemsPageCount,
  } = usePagination(filteredItems, 1, ITEMS_PER_PAGE);

  // Add search handlers
  const handlePartnerSearchChange = (e) => {
    setPartnerSearchTerm(e.target.value);
    setPage(1);
  };

  const handleItemSearchChange = (e) => {
    setItemSearchTerm(e.target.value);
    setItemsPage(1);
  };

  // Add handlers for editing
  const handleStartEdit = (type, id) => {
    if (type === "partner") {
      setEditingPartner(id);
    } else {
      setEditingItem(id);
    }
  };

  const handleFinishEdit = () => {
    setEditingPartner(null);
    setEditingItem(null);
  };

  // Update change handlers to support editing
  const handlePartnerChange = (index, field, value) => {
    const newPartners = [...partners];
    const partnerIndex = partners.findIndex(
      (p) => p.personnel_number === newPartners[index].personnel_number
    );
    if (partnerIndex !== -1) {
      newPartners[partnerIndex][field] = value;
      setPartners(newPartners);
    }
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    const itemIndex = items.findIndex((i) => i.sku === newItems[index].sku);
    if (itemIndex !== -1) {
      newItems[itemIndex].commission = value;
      setItems(newItems);
    }
  };

  return (
    <Layout>
      {isSmallScreen && (
        <PageTitle variant="h5">{t("commissions_config")}</PageTitle>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ContentWrapper>
        <FilterSection>
          <FilterGroup>
            <LabeledControl>
              <StyledFormControl>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  size="small"
                  placeholder={t("config_type")}
                >
                  <MenuItem value="Partner">{t("by_partner")}</MenuItem>
                  <MenuItem value="Item">{t("by_item")}</MenuItem>
                </Select>
              </StyledFormControl>
            </LabeledControl>

            {filter === "Partner" && (
              <LabeledControl>
                <SearchField
                  value={partnerSearchTerm}
                  onChange={handlePartnerSearchChange}
                  size="small"
                  variant="outlined"
                  placeholder={t("search_partner")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </LabeledControl>
            )}

            {filter === "Item" && (
              <LabeledControl>
                <SearchField
                  value={itemSearchTerm}
                  onChange={handleItemSearchChange}
                  size="small"
                  variant="outlined"
                  placeholder={t("search_items")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </LabeledControl>
            )}
          </FilterGroup>

          <ActionButton
            variant="outlined"
            onClick={filter === "Partner" ? handleOpenModal : handleAddArticle}
          >
            + {filter === "Partner" ? t("add_partner") : t("add_item")}
          </ActionButton>
        </FilterSection>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          <>
            {filter === "Partner" && (
              <Box>
                <PartnerTable
                  partners={displayedPartners}
                  onPartnerChange={handlePartnerChange}
                  page={page}
                  pageCount={partnerPageCount}
                  onPageChange={(e, val) => setPage(val)}
                  searchTerm={partnerSearchTerm}
                  onSearchChange={handlePartnerSearchChange}
                  t={t}
                  editingPartner={editingPartner}
                  onStartEdit={handleStartEdit}
                  onFinishEdit={handleFinishEdit}
                />
              </Box>
            )}

            {filter === "Item" && (
              <Box>
                <ItemTable
                  items={displayedItems}
                  onItemChange={handleItemChange}
                  page={itemsPage}
                  pageCount={itemsPageCount}
                  onPageChange={(e, val) => setItemsPage(val)}
                  searchTerm={itemSearchTerm}
                  onSearchChange={handleItemSearchChange}
                  t={t}
                  editingItem={editingItem}
                  onStartEdit={handleStartEdit}
                  onFinishEdit={handleFinishEdit}
                />
              </Box>
            )}
          </>
        )}
      </ContentWrapper>

      <BottomActionsContainer>
        <Box width="120px" />
        <PaginationWrapper>
          {!isLoading && filter === "Partner" && (
            <Pagination
              count={partnerPageCount}
              page={page}
              onChange={(e, val) => setPage(val)}
              size="small"
            />
          )}
          {!isLoading && filter === "Item" && (
            <Pagination
              count={itemsPageCount}
              page={itemsPage}
              onChange={(e, val) => setItemsPage(val)}
              size="small"
            />
          )}
        </PaginationWrapper>
        <Box width="120px" display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            disabled={isLoading}
            sx={buttonStyles}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("save_changes")
            )}
          </Button>
        </Box>
      </BottomActionsContainer>

      <AddPartnerModal
        open={openModal}
        onClose={handleCloseModal}
        onAdd={handleAddPartner}
        selectedId={selectedPartnerId}
        onSelectChange={(e) => setSelectedPartnerId(e.target.value)}
        partners={allAvailablePartners}
        addedIds={addedPersonnelNumbers}
        t={t}
      />
    </Layout>
  );
}

export default CommissionsConfig;
