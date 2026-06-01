import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrencyInput, formatCurrencyInput } from '@/lib/currency'

describe('formatCurrency', () => {
  it('formats typical IDR amounts', () => {
    expect(formatCurrency(0)).toBe('Rp\xa00')
    expect(formatCurrency(50000)).toBe('Rp\xa050.000')
    expect(formatCurrency(1000000)).toBe('Rp\xa01.000.000')
    expect(formatCurrency(15000000)).toBe('Rp\xa015.000.000')
  })
})

describe('parseCurrencyInput', () => {
  it('parses formatted input to number', () => {
    expect(parseCurrencyInput('50.000')).toBe(50000)
    expect(parseCurrencyInput('Rp 50.000')).toBe(50000)
    expect(parseCurrencyInput('1.000.000')).toBe(1000000)
    expect(parseCurrencyInput('')).toBe(0)
    expect(parseCurrencyInput('abc')).toBe(0)
  })
})

describe('formatCurrencyInput', () => {
  it('formats number for input display', () => {
    expect(formatCurrencyInput(0)).toBe('')
    expect(formatCurrencyInput(50000)).toBe('50.000')
    expect(formatCurrencyInput(1000000)).toBe('1.000.000')
    expect(formatCurrencyInput(15000000)).toBe('15.000.000')
  })
})
