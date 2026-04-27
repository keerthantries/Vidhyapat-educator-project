/**
 * auth.utils.js — Session helpers
 * Always use these instead of accessing localStorage directly.
 */

export const saveSession = ({ token, user, org }) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('org', JSON.stringify(org))
}

export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('org')
}

export const getToken  = () => localStorage.getItem('token')

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) }
  catch { return null }
}

export const getOrg = () => {
  try { return JSON.parse(localStorage.getItem('org')) }
  catch { return null }
}

export const isAuthenticated = () => !!getToken()
