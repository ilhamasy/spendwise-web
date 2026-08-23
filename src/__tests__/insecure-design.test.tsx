import { describe, it, expect } from 'vitest'
import { isValidFinancialAmount, isFutureOrToday } from '@/lib/utils'

describe('OWASP A04:2021 — Insecure Design (Business Logic & Boundary Rules)', () => {
  it('validates financial amount upper and lower bounds', () => {
    expect(isValidFinancialAmount(1000)).toBe(true)
    expect(isValidFinancialAmount(1000000000000)).toBe(true)

    expect(isValidFinancialAmount(0)).toBe(false)
    expect(isValidFinancialAmount(-500)).toBe(false)
    expect(isValidFinancialAmount(1000000000001)).toBe(false)
    expect(isValidFinancialAmount(NaN)).toBe(false)
  })

  it('validates target date is not in the past', () => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    expect(isFutureOrToday(today)).toBe(true)
    expect(isFutureOrToday(tomorrow)).toBe(true)
    expect(isFutureOrToday(yesterday)).toBe(false)
    expect(isFutureOrToday('')).toBe(false)
  })
})
