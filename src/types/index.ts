export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  occurredAt: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
}

export interface SavingGoal {
  id: string
  name: string
  targetAmount: number
  currentSaved: number
  targetDate?: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  currency: string
  theme: 'light' | 'dark'
  startingBalance?: number
  createdAt: string
}

export type Theme = 'light' | 'dark' | 'system'

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Transactions', href: '/transactions', icon: 'receipt' },
  { label: 'Goals', href: '/goals', icon: 'target' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
] as const
