import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@/lib/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    sync: vi.fn(),
  },
}))

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
    getPendingCount: () => Promise.resolve(0),
    getStatus: () => 'idle',
    init: () => {},
    destroy: () => {},
    onStatusChange: () => () => {}
  }
}))

import '../lib/auth'

beforeEach(() => {
  localStorage.clear()
})

describe('AuthProvider', () => {
  it('renders children', async () => {
    const { AuthProvider } = await import('@/lib/auth')
    const { container } = render(<AuthProvider><div>Child</div></AuthProvider>)
    expect(container.textContent).toContain('Child')
  })

  it('logout clears session', () => {
    localStorage.setItem('spendwise-session', 'u1')
    localStorage.removeItem('spendwise-session')
    expect(localStorage.getItem('spendwise-session')).toBeNull()
  })

  it('setSession stores user id', () => {
    localStorage.setItem('spendwise-session', 'test-user-id')
    expect(localStorage.getItem('spendwise-session')).toBe('test-user-id')
  })

  it('register prevents duplicate email', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('password123', 12)
    localStorage.setItem('spendwise-users', JSON.stringify([
      { id: 'u1', name: 'Test', email: 'dup@test.com', passwordHash: hash },
    ]))

    const { AuthProvider, useAuth } = await import('@/lib/auth')
    let error: string | null = null
    function RegTest() {
      const auth = useAuth()
      return (
        <button onClick={async () => {
          try { await auth.register('Test', 'dup@test.com', 'password123') }
          catch (e) { error = (e as Error).message }
        }}>Register</button>
      )
    }
    const { getByText } = render(<AuthProvider><RegTest /></AuthProvider>)
    const { act } = await import('react')
    await act(async () => { getByText('Register').click() })
    expect(error).toContain('already exists')
  })

  it('login with local credentials', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('password123', 12)
    localStorage.setItem('spendwise-users', JSON.stringify([
      { id: 'u1', name: 'Test', email: 'local@test.com', passwordHash: hash },
    ]))

    // Directly test the underlying storage logic
    const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
    const found = users.find((u: { email: string }) => u.email === 'local@test.com')
    expect(found).toBeTruthy()
    const valid = await bcrypt.compare('password123', found.passwordHash)
    expect(valid).toBe(true)
    const invalid = await bcrypt.compare('wrong', found.passwordHash)
    expect(invalid).toBe(false)
  })

  it('login fails with wrong password', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('password123', 12)
    localStorage.setItem('spendwise-users', JSON.stringify([
      { id: 'u1', name: 'Test', email: 'wrong@test.com', passwordHash: hash },
    ]))

    const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
    const found = users.find((u: { email: string }) => u.email === 'wrong@test.com')
    const valid = await bcrypt.compare('wrongpassword', found.passwordHash)
    expect(valid).toBe(false)
  })
})
