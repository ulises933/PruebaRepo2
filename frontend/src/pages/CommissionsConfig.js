/**
 * @fileoverview CommissionsConfig page component for managing partner and item commission configurations
 */

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Select,
  MenuItem,
  Button,
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
import { useAuthSSO } from "../context/AuthContextSSO";
import {
  PageTitle,
  ContentWrapper,
  FilterSection,
  StyledFormControl,
  ActionButton,
  buttonStyles,
  PaginationWrapper,
  BottomActionsContainer,
  FilterLabel,
  FilterGroup,
  LabeledControl,
  SearchField,
} from "../components/commissions/styles/CommissionsConfigStyles";
import { usePagination } from "../hooks/usePagination";
import PartnerTable from "../components/commissions/PartnerTable";
import GroupItemTable from "../components/commissions/GroupItemTable";
import AddPartnerModal from "../components/commissions/AddPartnerModal";
import SearchIcon from "@mui/icons-material/Search";
import AddGroupItemModal from "../components/commissions/AddGroupItemModal";
import Notification from "../components/common/Notification";

/**
 * CommissionsConfig Component
 * Allows configuring commission amounts for partners or items.
 * Provides functionality to:
 * - View and edit partner commission percentages and fixed fees
 * - View and edit item group commission percentages
 * - Add new partners and item groups
 * - Filter and search configurations
 * - Save changes to the backend
 */
function CommissionsConfig() {
  // Filter state between Partner and Item views
  const [filter, setFilter] = useState("Partner");

  // Data states
  const [partners, setPartners] = useState([]);
  const [itemGroups, setItemGroups] = useState([]);
  const [allAvailablePartners, setAllAvailablePartners] = useState([]);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ssoUser } = useAuthSSO();
  const { t } = useLanguage();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [customerPriceGroup, setCustomerPriceGroup] = useState("08");

  // Track already added partners
  const addedPersonnelNumbers = partners.map(
    (partner) => partner.personnel_number
  );

  const ITEMS_PER_PAGE = 19;

  // Search states
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  // Editing states
  const [editingPartner, setEditingPartner] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Item modal states
  const [openItemModal, setOpenItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    group1: "",
    group1_description: "",
    group2: "",
    group2_description: "",
    commission_percent: "0.00",
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  /**
   * Filter items based on search term
   * Searches across all item fields
   */
  const filteredItems = useMemo(() => {
    if (!itemSearchTerm || !itemGroups) return itemGroups || [];

    const search = itemSearchTerm.toLowerCase();
    return itemGroups.filter(
      (item) =>
        (item?.group1?.toLowerCase() || "").includes(search) ||
        (item?.group1_description?.toLowerCase() || "").includes(search) ||
        (item?.group2?.toLowerCase() || "").includes(search) ||
        (item?.group2_description?.toLowerCase() || "").includes(search) ||
        (item?.commission_percent?.toString() || "").includes(search) ||
        (item?.id?.toString() || "").includes(search)
    );
  }, [itemGroups, itemSearchTerm]);

  /**
   * Filter partners based on search term
   * Searches across all partner fields
   */
  const filteredPartners = useMemo(() => {
    if (!partnerSearchTerm || !partners) return partners || [];

    const search = partnerSearchTerm.toLowerCase();
    return partners.filter((partner) => {
      const searchableFields = [
        partner?.full_name?.toLowerCase() || "",
        partner?.personnel_number?.toString() || "",
        partner?.commission_percent?.toString() || "",
        partner?.fixed_fee?.toString() || "",
        partner?.customer_price_group?.toString() || "",
        partner?.id?.toString() || "",
        partner?.date_created?.toString() || "",
      ];

      return searchableFields.some((field) => field.includes(search));
    });
  }, [partners, partnerSearchTerm]);

  /**
   * Fetch partners and their configurations on mount
   * and when customer price group changes
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both partners and configurations
        const [partnersData, configsData] = await Promise.all([
          commissionConfigService.getPartners(),
          commissionConfigService.getPartnerConfigs(customerPriceGroup),
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
              id: config?.id || 0,
              personnel_number: partner.personnel_number,
              full_name: partner.full_name,
              commission_percent: config?.commission_percent || 0,
              fixed_fee: config?.fixed_fee || 0,
              customer_price_group:
                config?.customer_price_group || customerPriceGroup,
              date_created: config?.date_created || new Date().toISOString(),
            };
          });

        setPartners(partnersWithConfig);
      } catch (err) {
        showNotification(err.message || t("error"), "error");
        setAllAvailablePartners([]);
        setPartners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t, customerPriceGroup]);

  /**
   * Fetch item groups when filter changes to Item
   */
  useEffect(() => {
    const fetchItemGroups = async () => {
      if (filter === "Item") {
        try {
          setIsLoading(true);
          const itemGroupsData = await commissionConfigService.getItemConfigs(customerPriceGroup);
          setItemGroups(itemGroupsData);
        } catch (err) {
          showNotification(err.message || t("error"), "error");
          setItemGroups([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchItemGroups();
  }, [filter, customerPriceGroup]);

  /**
   * Shows a notification message
   */
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  /**
   * Saves changes to partner or item configurations
   */
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (filter === "Partner") {
        const configurations = partners.map((partner) => ({
          id: partner.id,
          commission_percent: parseFloat(partner.commission_percent) || 0,
          fixed_fee: parseFloat(partner.fixed_fee) || 0,
        }));

        await commissionConfigService.updatePartnerConfigs(
          configurations,
          ssoUser?.username
        );
      } else {
        // Handle item group configurations save
        const configurations = itemGroups.map((group) => ({
          id: group.id || -1,
          commission_percent: parseFloat(group.commission_percent) || 0,
        }));

        await commissionConfigService.updateItemConfigs(
          configurations,
          ssoUser?.username
        );
      }

      showNotification(t("changes_saved_successfully"), "success");
    } catch (err) {
      showNotification(err.message || t("error"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a new partner to the list
   */
  const handleAddPartner = (formData) => {
    const selectedPartner = allAvailablePartners.find(
      (partner) => partner.personnel_number === selectedPartnerId
    );

    if (selectedPartner) {
      setPartners([
        ...partners,
        {
          id: Date.now(),
          personnel_number: selectedPartnerId,
          full_name: selectedPartner.full_name,
          commission_percent: formData.commission_percent || "0.00",
          fixed_fee: formData.fixed_fee || "0.00",
          customer_price_group: customerPriceGroup,
          date_created: new Date().toISOString(),
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

  /**
   * Adds a new item group configuration
   */
  const handleAddItemGroup = async (itemData) => {
    try {
      const newItem = {
        ...itemData,
        customer_price_group: customerPriceGroup,
      };

      const response = await commissionConfigService.createItemConfig(
        newItem,
        ssoUser?.username
      );

      setItemGroups([
        ...itemGroups,
        {
          ...response,
          id: response.id,
          commission_percent: response.commission_percent.toFixed(2),
        },
      ]);

      setOpenItemModal(false);
      setNewItemData({
        group1: "",
        group1_description: "",
        group2: "",
        group2_description: "",
        commission_percent: "0.00",
      });

      showNotification(t("item_added_successfully"), "success");
    } catch (err) {
      showNotification(err.message || t("error_adding_item"), "error");
    }
  };

  // Pagination hooks for partners and items
  const {
    page,
    setPage,
    paginatedItems: displayedPartners,
    pageCount: partnerPageCount,
  } = usePagination(filteredPartners, 1, ITEMS_PER_PAGE);

  const {
    page: itemsPage,
    setPage: setItemsPage,
    paginatedItems: displayedItems,
    pageCount: itemsPageCount,
  } = usePagination(filteredItems, 1, ITEMS_PER_PAGE);

  // Search handlers
  const handlePartnerSearchChange = (e) => {
    setPartnerSearchTerm(e.target.value);
    setPage(1);
  };

  const handleItemSearchChange = (e) => {
    setItemSearchTerm(e.target.value);
    setItemsPage(1);
  };

  // Edit mode handlers
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

  /**
   * Updates partner data when edited
   */
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

  /**
   * Updates item group data when edited
   */
  const handleItemGroupChange = (index, field, value) => {
    const newItemGroups = [...itemGroups];
    const itemIndex = itemGroups.findIndex(
      (i) => i.id === newItemGroups[index].id
    );
    if (itemIndex !== -1) {
      newItemGroups[itemIndex][field] = value;
      setItemGroups(newItemGroups);
    }
  };

  const handleOpenItemModal = () => {
    setOpenItemModal(true);
  };

  const handleCloseItemModal = () => {
    setOpenItemModal(false);
    setNewItemData({
      group1: "",
      group1_description: "",
      group2: "",
      group2_description: "",
      commission_percent: "0.00",
    });
  };

  /**
   * Removes a partner from the list
   */
  const handleDeletePartner = (personnelNumber) => {
    setPartners(partners.filter((p) => p.personnel_number !== personnelNumber));
  };

  /**
   * Removes an item group from the list
   */
  const handleDeleteItemGroup = (id) => {
    setItemGroups(itemGroups.filter((group) => group.id !== id));
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
              <FilterLabel>{t("customer_price_group")}</FilterLabel>
              <StyledFormControl>
                <Select
                  value={customerPriceGroup}
                  onChange={(e) => setCustomerPriceGroup(e.target.value)}
                  size="small"
                  placeholder={t("customer_price_group")}
                >
                  <MenuItem value="08">Wiremax</MenuItem>
                  <MenuItem value="09">Otra</MenuItem>
                </Select>
              </StyledFormControl>
            </LabeledControl>
            <LabeledControl>
              <FilterLabel>{t("config_type")}</FilterLabel>
              <StyledFormControl>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  size="small"
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
            onClick={
              filter === "Partner" ? handleOpenModal : handleOpenItemModal
            }
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
                  onDeletePartner={handleDeletePartner}
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
                <GroupItemTable
                  itemGroups={filteredItems}
                  onItemGroupChange={handleItemGroupChange}
                  onDeleteItemGroup={handleDeleteItemGroup}
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

      <AddGroupItemModal
        open={openItemModal}
        onClose={handleCloseItemModal}
        onAdd={handleAddItemGroup}
        itemData={newItemData}
        onItemDataChange={setNewItemData}
        customerPriceGroup={customerPriceGroup}
        t={t}
      />

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Layout>
  );
}

export default CommissionsConfig;
