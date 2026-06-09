import { describe, it, expect } from 'vitest'
import { getFilterDateRange, getChartYear } from '@/components/DateFilter'

describe('getFilterDateRange', () => {
  it('returns today for weekly', () => {
    const { end } = getFilterDateRange('week', '', '')
    const today = new Date().toISOString().split('T')[0]
    expect(end).toBe(today)
  })

  it('returns today for monthly', () => {
    const { end } = getFilterDateRange('month', '', '')
    const today = new Date().toISOString().split('T')[0]
    expect(end).toBe(today)
  })

  it('returns first day of year for yearly start', () => {
    const { start } = getFilterDateRange('year', '', '')
    const year = new Date().getFullYear()
    expect(start).toBe(`${year}-01-01`)
  })

  it('returns first day of month for monthly start', () => {
    const { start } = getFilterDateRange('month', '', '')
    const now = new Date()
    expect(start).toBe(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
  })

  it('returns custom range when custom period', () => {
    const range = getFilterDateRange('custom', '2026-01-15', '2026-02-15')
    expect(range.start).toBe('2026-01-15')
    expect(range.end).toBe('2026-02-15')
  })
})

describe('getChartYear', () => {
  it('returns current year for non-custom period', () => {
    const year = getChartYear('month', '', '')
    expect(year).toBe(new Date().getFullYear())
  })

  it('returns start year when months span equal', () => {
    const year = getChartYear('custom', '2026-06-01', '2026-08-31')
    expect(year).toBe(2026)
  })

  it('returns year with more months in range', () => {
    const year = getChartYear('custom', '2025-10-01', '2026-03-31')
    // Oct 2025-Mar 2026: startMonths = 12-9 = 3, endMonths = 2+1 = 3. Equal → returns startYear
    expect(year).toBe(2025)
  })
})

describe('getFilterDateRange - edge cases', () => {
  it('weekly start is Monday', () => {
    const { start, end } = getFilterDateRange('week', '', '')
    expect(start).toBeTruthy()
    expect(end).toBeTruthy()
    expect(new Date(start).getDay()).toBe(1) // Monday
  })
})
