import appConfig from "../config/appConfig";

/**
 * Get list of partners/agents
 * @param {string} [customerPriceGroup] - Optional customer price group filter
 * @returns {Promise<Array>} List of partners
 */
export async function getPartners(customerPriceGroup = "") {
  const params = new URLSearchParams();
  if (customerPriceGroup) {
    params.append("customer_price_group", customerPriceGroup);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}/partners?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.displayMessage || "Error fetching partners");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create a new partner commission configuration
 * @param {Object} configuration - Partner configuration object containing personnel_number, full_name, commission_percent, fixed_fee and customer_price_group
 * @param {string} userMod - Username of user making modification
 * @returns {Promise<Object>} Created configuration
 */
export async function createPartnerConfig(configuration, userMod) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/partner_configuration?user_mod=${userMod}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configuration),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.displayMessage || "Error creating configuration");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update existing partner configurations
 * @param {Array<Object>} configurations - Array of partner configurations to update, each containing id, commission_percent and fixed_fee
 * @param {string} userMod - Username of user making modification
 * @returns {Promise<Array>} Updated configurations
 */
export async function updatePartnerConfigs(configurations, userMod) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/partner_configurations?user_mod=${userMod}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configurations),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.displayMessage || "Error updating configurations");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get list of partner configurations
 * @param {string} customerPriceGroup - Customer price group to filter by
 * @returns {Promise<Array>} List of partner configurations
 */
export async function getPartnerConfigs(customerPriceGroup) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/partner_configurations?customer_price_group=${customerPriceGroup}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.displayMessage || "Error fetching configurations");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get list of item groups
 * @param {number} level - Level of item groups to retrieve (1 or 2)
 * @param {string} [customerPriceGroup] - Optional customer price group filter
 * @returns {Promise<Array>} List of item groups
 */
export async function getItemGroups(level, parent_code = null, customerPriceGroup = "") {
  const params = new URLSearchParams({ level: level, parent_code: parent_code });
  if (customerPriceGroup) {
    params.append("customer_price_group", customerPriceGroup);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}/item_groups?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.displayMessage || "Error fetching item groups");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create a new item commission configuration
 * @param {Object} configuration - Item configuration object containing group1, group1_description, group2, group2_description, commission_percent and customer_price_group
 * @param {string} userMod - Username of user making modification
 * @returns {Promise<Object>} Created configuration
 */
export async function createItemConfig(configuration, userMod) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/item_configuration?user_mod=${userMod}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configuration),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.displayMessage || "Error creating item configuration"
    );
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update existing item configurations
 * @param {Array<Object>} configurations - Array of item configurations to update, each containing id and commission_percent
 * @param {string} userMod - Username of user making modification
 * @returns {Promise<Array>} Updated configurations
 */
export async function updateItemConfigs(configurations, userMod) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/item_configurations?user_mod=${userMod}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configurations),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.displayMessage || "Error updating item configurations"
    );
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get list of item configurations
 * @param {string} customerPriceGroup - Customer price group to filter by
 * @returns {Promise<Array>} List of item configurations
 */
export async function getItemConfigs(customerPriceGroup) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/item_configurations?customer_price_group=${customerPriceGroup}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.displayMessage || "Error fetching item configurations"
    );
  }

  const data = await response.json();
  console.log(data.data);
  return data.data;
}

/**
 * Get list of items in specified groups
 * @param {string} group1 - First group identifier
 * @param {string} [group2] - Optional second group identifier
 * @returns {Promise<Array>} List of items
 */
export async function getItems(group1, group2 = "") {
  const params = new URLSearchParams({ group1 });
  if (group2) {
    params.append("group2", group2);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}/items?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.displayMessage || "Error fetching items");
  }

  const data = await response.json();
  return data.data;
}

export const commissionConfigService = {
  getPartners,
  createPartnerConfig,
  updatePartnerConfigs,
  getPartnerConfigs,
  getItemGroups,
  createItemConfig,
  updateItemConfigs,
  getItemConfigs,
  getItems,
};

export default commissionConfigService;
