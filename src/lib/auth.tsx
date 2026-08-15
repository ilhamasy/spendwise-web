'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/api'
import { syncManager } from '@/lib/sync-manager'

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: (force?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
}

function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('spendwise-users')
  return data ? JSON.parse(data) : []
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem('spendwise-users', JSON.stringify(users))
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`
}

function setSession(userId: string, token?: string) {
  setCookie('spendwise-session', userId, 7)
  if (token) {
    setCookie('spendwise-token', token, 7)
  }
}

function clearSession() {
  deleteCookie('spendwise-session')
  deleteCookie('spendwise-token')
  deleteCookie('spendwise-access-token')
  deleteCookie('spendwise-refresh-token')
  deleteCookie('spendwise-profile')
  localStorage.removeItem('spendwise-users')
}

function getSession(): string | null {
  return getCookie('spendwise-session')
}

function setProfile(profile: { id: string; name: string; email: string }) {
  setCookie('spendwise-profile', JSON.stringify(profile), 7)
}

function getProfile(): { id: string; name: string; email: string } | null {
  const raw = getCookie('spendwise-profile')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const sessionId = getSession()
    if (sessionId) {
      const profile = getProfile()
      if (profile) {
        setUser({ id: profile.id, name: profile.name, email: profile.email })
      } else {
        const users = getUsers()
        const found = users.find((u) => u.id === sessionId)
        if (found) {
          setUser({ id: found.id, name: found.name, email: found.email })
        }
      }
    }
    setIsLoading(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.login(email, password)
      setSession(res.user.id, res.accessToken)
      setProfile(res.user)
      setUser({ id: res.user.id, name: res.user.name, email: res.user.email })
      return
    } catch {
      // API failed, fall back to offline localStorage auth
    }

    const bcrypt = await import('bcryptjs')
    const users = getUsers()
    const found = users.find((u) => u.email === email)
    if (!found) {
      throw new Error('Invalid email or password')
    }
    const valid = await bcrypt.compare(password, found.passwordHash)
    if (!valid) {
      throw new Error('Invalid email or password')
    }
    setSession(found.id)
    setUser({ id: found.id, name: found.name, email: found.email })
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await api.register(name, email, password)
      setSession(res.user.id, res.accessToken)
      setProfile(res.user)
      return
    } catch {
      // API failed, fall back to offline localStorage registration
    }

    const bcrypt = await import('bcryptjs')
    const users = getUsers()
    if (users.some((u) => u.email === email)) {
      throw new Error('An account with this email already exists')
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
    }
    saveUsers([...users, newUser])
  }, [])

  const logout = useCallback(async (_force = false) => {
    clearSession()
    localStorage.removeItem('spendwise-sync-meta')
    syncManager.destroy()
    setUser(null)
    api.logout().catch(() => {})
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
