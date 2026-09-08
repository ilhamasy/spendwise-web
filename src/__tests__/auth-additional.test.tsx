import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

vi.mock('@/lib/api', () => ({
  api: {
    login: vi.fn().mockRejectedValue(new Error('API down')),
    register: vi.fn().mockRejectedValue(new Error('API down')),
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
    onStatusChange: () => () => {},
  },
}))

import { AuthProvider, useAuth } from '@/lib/auth'

beforeEach(() => {
  localStorage.clear()
  document.cookie.split(';').forEach(c => {
    const eqPos = c.indexOf('=')
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
    document.cookie = `${name}=; path=/; max-age=0`
  })
})

describe('AuthProvider - offline register', () => {
  it('registers user in localStorage when API fails', async () => {
    let done = false

    function RegTest() {
      const auth = useAuth()
      React.useEffect(() => {
        auth.register('Offline User', 'offline@test.com', 'password123').then(() => { done = true })
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }

    render(<AuthProvider><RegTest /></AuthProvider>)
    await waitFor(() => { expect(done).toBe(true) }, { timeout: 3000 })

    const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
    expect(users.length).toBe(1)
    expect(users[0].name).toBe('Offline User')
    expect(users[0].email).toBe('offline@test.com')
    expect(users[0].passwordHash).toBeTruthy()
  })

  it('prevents duplicate email registration', async () => {
    const user = userEvent.setup()
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('password123', 12)
    localStorage.setItem('spendwise-users', JSON.stringify([
      { id: 'existing', name: 'Existing', email: 'dup@test.com', passwordHash: hash },
    ]))

    let errorMsg = ''

    function RegTest() {
      const auth = useAuth()
      return (
        <button onClick={async () => {
          try { await auth.register('New', 'dup@test.com', 'password123') }
          catch (e) { errorMsg = (e as Error).message }
        }}>Register</button>
      )
    }

    const { getByText } = render(<AuthProvider><RegTest /></AuthProvider>)
    await user.click(getByText('Register'))
    await waitFor(() => { expect(errorMsg).toContain('already exists') })
  })
})

describe('AuthProvider - offline login', () => {
  it('throws error for non-existent email', async () => {
    const user = userEvent.setup()
    let errorMsg = ''

    function LoginTest() {
      const auth = useAuth()
      return (
        <button onClick={async () => {
          try { await auth.login('nobody@test.com', 'password') }
          catch (e) { errorMsg = (e as Error).message }
        }}>Login</button>
      )
    }

    const { getByText } = render(<AuthProvider><LoginTest /></AuthProvider>)
    await user.click(getByText('Login'))
    await waitFor(() => { expect(errorMsg).toContain('Invalid email or password') })
  })

  it('throws error for wrong password', async () => {
    const user = userEvent.setup()
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('correct', 12)
    localStorage.setItem('spendwise-users', JSON.stringify([
      { id: 'u1', name: 'Test', email: 'wrong@test.com', passwordHash: hash },
    ]))

    let errorMsg = ''

    function LoginTest() {
      const auth = useAuth()
      return (
        <button onClick={async () => {
          try { await auth.login('wrong@test.com', 'wrongpassword') }
          catch (e) { errorMsg = (e as Error).message }
        }}>Login</button>
      )
    }

    const { getByText } = render(<AuthProvider><LoginTest /></AuthProvider>)
    await user.click(getByText('Login'))
    await waitFor(() => { expect(errorMsg).toContain('Invalid email or password') })
  })

  it('logs in with correct credentials and sets session', async () => {
    const user = userEvent.setup()
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('mypassword', 12)
    localStorage.setItem('spendwise-users', JSON.stringify([
      { id: 'u1', name: 'Test', email: 'login@test.com', passwordHash: hash },
    ]))

    let loggedIn = false

    function LoginTest() {
      const auth = useAuth()
      return (
        <button onClick={async () => {
          await auth.login('login@test.com', 'mypassword')
          loggedIn = true
        }}>Login</button>
      )
    }

    const { getByText } = render(<AuthProvider><LoginTest /></AuthProvider>)
    await user.click(getByText('Login'))
    await waitFor(() => { expect(loggedIn).toBe(true) })
    expect(document.cookie).toContain('spendwise-session')
  })
})

describe('AuthProvider - state', () => {
  it.skip('starts with isLoading true', () => {
    let capturedLoading: boolean | undefined
    let capturedUser: unknown

    function Capture() {
      const auth = useAuth()
      capturedLoading = auth.isLoading
      capturedUser = auth.user
      return null
    }

    render(<AuthProvider><Capture /></AuthProvider>)
    expect(capturedLoading).toBe(true)
    expect(capturedUser).toBeNull()
  })
})
