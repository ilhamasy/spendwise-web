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
  logout: () => Promise<void>
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

function setSession(userId: string, token?: string) {
  localStorage.setItem('spendwise-session', userId)
  if (token) {
    document.cookie = `spendwise-token=${token}; path=/; max-age=604800; SameSite=Lax`
  }
}

function clearSession() {
  localStorage.removeItem('spendwise-session')
  localStorage.removeItem('spendwise-token')
  document.cookie = 'spendwise-token=; path=/; max-age=0'
}

function getSession(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('spendwise-session')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionId = getSession()
    if (sessionId) {
      const storedProfile = localStorage.getItem('spendwise-profile')
      if (storedProfile) {
        const profile = JSON.parse(storedProfile)
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.login(email, password)
      setSession(res.user.id)
      localStorage.setItem('spendwise-profile', JSON.stringify(res.user))
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
      setSession(res.user.id)
      localStorage.setItem('spendwise-profile', JSON.stringify(res.user))
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

  const logout = useCallback(async () => {
    let tries = 0
    while (navigator.onLine && tries < 3) {
      const pending = await syncManager.getPendingCount()
      if (pending === 0) break
      await syncManager.processQueue()
      tries++
      if (tries < 3) await new Promise((r) => setTimeout(r, 2000))
    }
    clearSession()
    localStorage.removeItem('spendwise-profile')
    localStorage.removeItem('spendwise-sync-meta')
    syncManager.destroy()
    setUser(null)
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
