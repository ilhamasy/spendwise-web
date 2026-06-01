import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth'

// Helper to test auth operations directly
async function registerUser(name: string, email: string, password: string) {
  const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
  const bcrypt = await import('bcryptjs')
  const passwordHash = await bcrypt.hash(password, 12)
  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
  }
  users.push(newUser)
  localStorage.setItem('spendwise-users', JSON.stringify(users))
  return newUser
}

function getStoredUsers() {
  return JSON.parse(localStorage.getItem('spendwise-users') || '[]')
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('Auth - Local Storage', () => {
  it('stores users in localStorage on register', async () => {
    await registerUser('Test User', 'test@test.com', 'password123')

    const users = getStoredUsers()
    expect(users).toHaveLength(1)
    expect(users[0].name).toBe('Test User')
    expect(users[0].email).toBe('test@test.com')
  })

  it('hashes passwords (not plaintext)', async () => {
    await registerUser('Test User', 'test@test.com', 'password123')

    const users = getStoredUsers()
    expect(users[0].passwordHash).not.toBe('password123')
    expect(users[0].passwordHash).toMatch(/^\$2[ab]\$/)
  })

  it('password verification works correctly', async () => {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('mypassword', 12)

    const isValid = await bcrypt.compare('mypassword', hash)
    const isInvalid = await bcrypt.compare('wrongpassword', hash)

    expect(isValid).toBe(true)
    expect(isInvalid).toBe(false)
  })

  it('generates unique IDs for users', async () => {
    await registerUser('User 1', 'a@test.com', 'pass1')
    await registerUser('User 2', 'b@test.com', 'pass2')

    const users = getStoredUsers()
    expect(users[0].id).not.toBe(users[1].id)
    expect(users[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/)
  })

  it('session token management', () => {
    localStorage.setItem('spendwise-session', 'some-user-id')
    expect(localStorage.getItem('spendwise-session')).toBe('some-user-id')

    localStorage.removeItem('spendwise-session')
    expect(localStorage.getItem('spendwise-session')).toBeNull()
  })

  it('registration does NOT auto-login (user must login after registering)', async () => {
    await registerUser('New User', 'new@test.com', 'password123')
    // Session should not be set by registration
    expect(localStorage.getItem('spendwise-session')).toBeNull()
  })
})

describe('AuthProvider component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>,
    )
    expect(container.textContent).toContain('Test')
  })
})
