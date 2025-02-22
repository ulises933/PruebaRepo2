import appConfig from '../config/appConfig'

/**
 * Retrieves invoice data from the backend (facturas).
 */
export async function getInvoices() {
  const response = await fetch(`${appConfig.apiBaseUrl}/`)
  if (!response.ok) {
    throw new Error('Error fetching invoices')
  }
  return response.json()
}

/**
 * Saves invoice changes (payable status, etc.) by calling /guardar_cambios.
 * 
 * @param {Array} invoiceChanges 
 */
export async function saveInvoiceChanges(invoiceChanges) {
  const response = await fetch(`${appConfig.apiBaseUrl}/guardar_cambios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facturas: invoiceChanges })
  })
  if (!response.ok) {
    throw new Error('Error saving invoice changes')
  }
  return response.json()
}

/**
 * Triggers the "monthly cut" on the backend by calling /generar_corte.
 */
export async function generateMonthlyCut() {
  const response = await fetch(`${appConfig.apiBaseUrl}/generar_corte`, {
    method: 'POST'
  })
  if (!response.ok) {
    throw new Error('Error generating monthly cut')
  }
  return response.json()
}
