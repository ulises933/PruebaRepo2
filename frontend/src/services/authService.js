import appConfig from '../config/appConfig'

export async function loginApi(username, password) {
  const response = await fetch(`${appConfig.apiBaseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!response.ok) {
    throw new Error('Error al iniciar sesión')
  }
  return response.json()
}
