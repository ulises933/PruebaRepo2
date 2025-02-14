import appConfig from '../config/appConfig'

export async function getPagos() {
  const response = await fetch(`${appConfig.apiBaseUrl}/pagos`)
  if (!response.ok) {
    throw new Error('Error al obtener pagos')
  }
  return response.json()
}
