import { describe, it, expect } from 'vitest'
import { sanitizeLogData, logSecurityEvent } from '@/lib/logger'

describe('OWASP A09:2021 — Security Logging and Monitoring Failures', () => {
  it('redacts sensitive fields like password and token from log context', () => {
    const rawContext = {
      userEmail: 'user@example.com',
      password: 'MySecretPassword123!',
      token: 'jwt-token-string',
      action: 'login',
    }

    const sanitized = sanitizeLogData(rawContext)
    expect(sanitized.userEmail).toBe('user@example.com')
    expect(sanitized.password).toBe('[REDACTED]')
    expect(sanitized.token).toBe('[REDACTED]')
    expect(sanitized.action).toBe('login')
  })

  it('structures security log entries correctly with timestamps', () => {
    const entry = logSecurityEvent({
      level: 'warn',
      event: 'LOGIN_FAILURE',
      message: 'Invalid credentials supplied',
      context: { email: 'baduser@example.com', password: '123' },
    })

    expect(entry.timestamp).toBeDefined()
    expect(entry.event).toBe('LOGIN_FAILURE')
    expect(entry.context?.password).toBe('[REDACTED]')
  })
})
