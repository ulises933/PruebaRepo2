import appConfig from '../config/appConfig'

/**
 * Retrieves payment data from the backend (pagos).
 */
export async function getPayments() {
  const response = await fetch(`${appConfig.apiBaseUrl}/pagos`)
  if (!response.ok) {
    throw new Error('Error fetching payments')
  }
  return response.json()
}
