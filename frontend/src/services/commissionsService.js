import appConfig from "../config/appConfig";

/**
 * This service communicates with the real FastAPI backend for
 * commissions data, including retrieving and updating billing documents.
 */

/**
 * Fetches invoice/factura data from /comission_summary with specified query params:
 *  - year
 *  - month
 *  - personnel_number
 *  - customer_price_group
 *  - language
 *
 * The endpoint returns a JSON with "returnData" array and "displayMessage".
 * Example:
 * {
 *   "returnData": [ { "id": 123, "billing_document": "...", "estatus": "pagable", ... } ],
 *   "displayMessage": "..."
 * }
 */
export async function getCommissionsSummary(
  year = 2025,
  month = 3,
  personnel_number = "0",
  customer_price_group = "08",
  language = "EN"
) {
  const params = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    personnel_number,
    customer_price_group,
    language,
  });

  const url = `${appConfig.apiBaseUrl}/comission_summary?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error fetching commission summary");
    }
    const data = await response.json();
    return data.data?.returnData || [];
  } catch (error) {
    throw new Error(`Failed to fetch commission summary: ${error.message}`);
  }
}

/**
 * Fetches commission totals by partner with specified query params:
 *  - year
 *  - month
 *  - customer_price_group
 */
export async function getCommissionsByPartner(
  year = new Date().getFullYear(),
  month = new Date().getMonth()+1,
  customer_price_group = "08",
) {
  const params = new URLSearchParams({
    year: year.toString(),
    month: month.toString(),
    customer_price_group,
  });

  const url = `${appConfig.apiBaseUrl}/commissions_by_partner?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Error fetching commission totals");
    }
    const data = await response.json();
    return data.data?.returnData || [];
  } catch (error) {
    throw new Error(`Failed to fetch commission totals: ${error.message}`);
  }
}

/**
 * Updates (saves) invoice statuses by calling POST /guardar_cambios.
 *
 * The request body expects:
 * {
 *   "modified_billing_docs": [
 *     { "id": number, "status": "payable|not payable|pending", "monthly_cut_id": number }
 *   ],
 *   "user_mod": string
 * }
 */
export async function saveInvoiceStatuses(billingDocs, userMod) {
  const body = {
    modified_billing_docs: billingDocs,
    user_mod: userMod,
  };

  const response = await fetch(`${appConfig.apiBaseUrl}/guardar_cambios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Error updating invoices status");
  }

  return response.json();
}

/**
 * Closes a billing cycle by calling POST /close_billing_cycle.
 *
 * The body should include:
 * {
 *   "year": number,
 *   "month": number,
 *   "user": string,
 *   "personnel_number": "0",
 *   "customer_price_group": "",
 *   "language": "EN"
 * }
 */
export async function closeBillingCycle(
  year,
  month,
  user,
  personnel_number = "0",
  customer_price_group = "08",
  language = "EN"
) {
  const body = {
    year,
    month,
    user,
    personnel_number,
    customer_price_group,
    language,
  };

  const response = await fetch(`${appConfig.apiBaseUrl}/close_billing_cycle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Error closing billing cycle");
  }

  return response.json();
}
