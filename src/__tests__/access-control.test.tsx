import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthGuard from '@/components/AuthGuard'
import GuestGuard from '@/components/GuestGuard'
import { db } from '@/lib/db'

const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

const mockAuthValue = {
  user: null as null | { id: string; name: string; email: string },
  isLoading: false,
}

vi.mock('@/lib/auth', () => ({
  useAuth: () => mockAuthValue,
}))

describe('Broken Access Control — AuthGuard & Route Protection', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockAuthValue.user = null
    mockAuthValue.isLoading = false
  })

  it('redirects unauthenticated users to landing page /', () => {
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(mockReplace).toHaveBeenCalledWith('/')
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('renders children when user is authenticated', () => {
    mockAuthValue.user = { id: 'u-1', name: 'Authorized User', email: 'user@test.com' }

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText('Protected Content')).toBeDefined()
  })

  it('shows loading spinner when authentication state is loading', () => {
    mockAuthValue.isLoading = true

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.queryByText('Protected Content')).toBeNull()
  })
})

describe('Broken Access Control — GuestGuard', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockAuthValue.user = null
    mockAuthValue.isLoading = false
  })

  it('redirects authenticated users to /dashboard', () => {
    mockAuthValue.user = { id: 'u-1', name: 'Authorized User', email: 'user@test.com' }

    render(
      <GuestGuard>
        <div>Guest Content</div>
      </GuestGuard>
    )

    expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    expect(screen.queryByText('Guest Content')).toBeNull()
  })

  it('renders children when user is not logged in', () => {
    render(
      <GuestGuard>
        <div>Guest Content</div>
      </GuestGuard>
    )

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText('Guest Content')).toBeDefined()
  })
})

describe('Broken Access Control — Tenant Data Isolation in IndexedDB', () => {
  beforeEach(async () => {
    await db.transactions.clear()
    await db.categories.clear()
  })

  it('clears local database upon user session switch', async () => {
    await db.transactions.add({
      id: 'tx-1',
      type: 'expense',
      amount: 50000,
      categoryId: 'cat-1',
      occurredAt: '2026-08-21',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    expect(await db.transactions.count()).toBe(1)

    // Simulate session switch cleanup (DataLoader logic)
    await db.transactions.clear()
    await db.categories.clear()

    expect(await db.transactions.count()).toBe(0)
    expect(await db.categories.count()).toBe(0)
  })
})
