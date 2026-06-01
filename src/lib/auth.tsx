'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

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

function setSession(userId: string) {
  localStorage.setItem('spendwise-session', userId)
}

function clearSession() {
  localStorage.removeItem('spendwise-session')
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
      const users = getUsers()
      const found = users.find((u) => u.id === sessionId)
      if (found) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({ id: found.id, name: found.name, email: found.email })
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers()
    const found = users.find((u) => u.email === email)
    if (!found) {
      throw new Error('Invalid email or password')
    }
    const valid = await comparePassword(password, found.passwordHash)
    if (!valid) {
      throw new Error('Invalid email or password')
    }
    setSession(found.id)
    setUser({ id: found.id, name: found.name, email: found.email })
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = getUsers()
    if (users.some((u) => u.email === email)) {
      throw new Error('An account with this email already exists')
    }
    const passwordHash = await hashPassword(password)
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
    }
    saveUsers([...users, newUser])
  }, [])

  const logout = useCallback(() => {
    clearSession()
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
