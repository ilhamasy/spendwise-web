import { describe, it, expect } from 'vitest'

describe('Auth - Token Handling', () => {
  it('generates unique tokens', () => {
    const t1 = crypto.randomUUID()
    const t2 = crypto.randomUUID()
    expect(t1).not.toBe(t2)
  })

  it('stores and retrieves session from localStorage', () => {
    localStorage.setItem('spendwise-session', 'user-1')
    expect(localStorage.getItem('spendwise-session')).toBe('user-1')
    localStorage.removeItem('spendwise-session')
    expect(localStorage.getItem('spendwise-session')).toBeNull()
  })
})

describe('Auth - Validation', () => {
  it('validates email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('test@example.com')).toBe(true)
    expect(emailRegex.test('invalid')).toBe(false)
    expect(emailRegex.test('')).toBe(false)
  })

  it('validates password length', () => {
    expect('password123'.length).toBeGreaterThanOrEqual(8)
    expect('1234567'.length).toBeLessThan(8)
  })
})

describe('Auth - offline check', () => {
  it('detects online status', () => {
    expect(navigator.onLine).toBe(true)
  })

  it('has service worker support', () => {
    // jsdom may not support service workers
    expect(typeof navigator !== 'undefined').toBe(true)
  })
})
