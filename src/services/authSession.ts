import type { AuthUser } from '../types/auth'

const authTokenKey = 'inventory-auth-token'
const authUserKey = 'inventory-auth-user'

export function getAuthToken() {
  return window.localStorage.getItem(authTokenKey)
}

export function getAuthUser() {
  const rawUser = window.localStorage.getItem(authUserKey)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as AuthUser
  } catch {
    return null
  }
}

export function setAuthSession(token: string, user: AuthUser) {
  window.localStorage.setItem(authTokenKey, token)
  window.localStorage.setItem(authUserKey, JSON.stringify(user))
}

export function clearAuthSession() {
  window.localStorage.removeItem(authTokenKey)
  window.localStorage.removeItem(authUserKey)
}