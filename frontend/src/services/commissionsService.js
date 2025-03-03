import appConfig from '../config/appConfig'

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
export async function getCommissionsSummary({
  year = 2025,
  month = 1,
  personnel_number = '0',
  customer_price_group = '',
  language = 'EN'
}) {
  const url = new URL(`${appConfig.apiBaseUrl}/comission_summary`)
  url.searchParams.set('year', year)
  url.searchParams.set('month', month)
  url.searchParams.set('personnel_number', personnel_number)
  url.searchParams.set('customer_price_group', customer_price_group)
  url.searchParams.set('language', language)
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error fetching commission summary')
  }
  
  const data = await response.json()
  // data.returnData is an array of FacturaTracking
  return data.returnData || []
}

/**
 * Updates (saves) invoice statuses by calling POST /guardar_cambios.
 * 
 * The request body expects:
 * {
 *   "facturas_modificadas": [
 *     { "id": number, "estatus": "pagable|no pagable|pendiente", "id_corte": number }
 *   ],
 *   "usuario_modificador": string
 * }
 */
export async function saveInvoiceStatuses(facturas, usuarioModificador = 'system_user') {
  const body = {
    facturas_modificadas: facturas,
    usuario_modificador: usuarioModificador
  }
  
  const response = await fetch(`${appConfig.apiBaseUrl}/guardar_cambios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  if (!response.ok) {
    throw new Error('Error updating invoices status')
  }
  
  return response.json()
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
export async function closeBillingCycle({
  year,
  month,
  user,
  personnel_number = '0',
  customer_price_group = '',
  language = 'EN'
}) {
  const body = {
    year,
    month,
    user,
    personnel_number,
    customer_price_group,
    language
  }
  
  const response = await fetch(`${appConfig.apiBaseUrl}/close_billing_cycle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  if (!response.ok) {
    throw new Error('Error closing billing cycle')
  }
  
  return response.json()
}
