import appConfig from '../config/appConfig'

export async function getFacturas() {
  const response = await fetch(`${appConfig.apiBaseUrl}/`)
  if (!response.ok) {
    throw new Error('Error al obtener facturas')
  }
  return response.json()
}

export async function saveChanges(facturas) {
  const response = await fetch(`${appConfig.apiBaseUrl}/guardar_cambios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facturas })
  })
  if (!response.ok) {
    throw new Error('Error al guardar cambios')
  }
  return response.json()
}

export async function generarCorte() {
  const response = await fetch(`${appConfig.apiBaseUrl}/generar_corte`, {
    method: 'POST'
  })
  if (!response.ok) {
    throw new Error('Error al generar corte')
  }
  return response.json()
}
