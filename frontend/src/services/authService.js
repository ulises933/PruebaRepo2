import appConfig from '../config/appConfig'

/**
 * Calls the backend to authenticate a user based on username and password.
 */
export async function loginApi(username, password) {
  const response = await fetch(`${appConfig.apiBaseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}
