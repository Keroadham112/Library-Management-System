export type AuthUser = {
  id: number
  username: string
  role: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  expiresAt: string
  user: AuthUser
}