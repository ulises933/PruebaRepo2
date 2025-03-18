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

  console.log(`${appConfig.apiBaseUrl}/partners?${params}`);
  if (!response.ok) {
    throw new Error("Error fetching partners");
  }

  const data = await response.json();

  // Ensure we return an array
  return Array.isArray(data.data) ? data.data : [];
}

/**
 * Create a new partner commission configuration
 * @param {Object} configuration - Partner configuration object
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
    throw new Error("Error creating configuration");
  }

  return response.json();
}

/**
 * Update existing partner configurations
 * @param {Array<Object>} configurations - Array of partner configurations to update
 * @param {string} userMod - Username of user making modification
 * @returns {Promise<Array>} Updated configurations
 */
export async function updatePartnerConfigs(configurations, userMod) {
  const response = await fetch(
    `${appConfig.apiBaseUrl}/partner_configuration?user_mod=${userMod}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configurations),
    }
  );

  if (!response.ok) {
    throw new Error("Error updating configurations");
  }

  return response.json();
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
    throw new Error("Error fetching configurations");
  }

  const data = await response.json();
  // Ensure we return an array
  return Array.isArray(data) ? data : [];
}

export const commissionConfigService = {
  getPartners,
  createPartnerConfig,
  updatePartnerConfigs,
  getPartnerConfigs,
};

export default commissionConfigService;
