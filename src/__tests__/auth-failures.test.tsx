import { describe, it, expect } from 'vitest'
import { validatePasswordStrength } from '@/lib/utils'

describe('OWASP A07:2021 — Identification and Authentication Failures', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const res = validatePasswordStrength('Short1')
    expect(res.valid).toBe(false)
    expect(res.message).toContain('at least 8 characters')
  })

  it('rejects common weak passwords', () => {
    const res1 = validatePasswordStrength('12345678')
    expect(res1.valid).toBe(false)

    const res2 = validatePasswordStrength('password')
    expect(res2.valid).toBe(false)
  })

  it('accepts strong complex passwords', () => {
    const res = validatePasswordStrength('StrongAuthPass123!')
    expect(res.valid).toBe(true)
    expect(res.message).toBeUndefined()
  })
})
