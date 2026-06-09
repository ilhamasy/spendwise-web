import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
  },
}))

describe('Currency edge cases', () => {
  it('formats large numbers', async () => {
    const { formatCurrency } = await import('@/lib/currency')
    expect(formatCurrency(15000000)).toContain('Rp')
    expect(formatCurrency(15000000)).toContain('15.000.000')
  })

  it('parses currency input', async () => {
    const { parseCurrencyInput, formatCurrencyInput } = await import('@/lib/currency')
    expect(parseCurrencyInput('50.000')).toBe(50000)
    expect(parseCurrencyInput('abc')).toBe(0)
    expect(parseCurrencyInput('')).toBe(0)
    expect(formatCurrencyInput(0)).toBe('')
    expect(formatCurrencyInput(1000)).toBe('1.000')
  })
})

describe('Utils', () => {
  it('cn handles empty args', async () => {
    const { cn } = await import('@/lib/utils')
    expect(cn()).toBe('')
    expect(cn('a', '', 'b')).toBe('a b')
  })

  it('generateId produces UUID', async () => {
    const { generateId } = await import('@/lib/utils')
    const id = generateId()
    expect(id.length).toBe(36)
    expect(id.split('-')).toHaveLength(5)
  })
})

describe('Constants', () => {
  it('has category emojis', async () => {
    const { CATEGORY_EMOJIS } = await import('@/lib/constants')
    expect(Array.isArray(CATEGORY_EMOJIS)).toBe(true)
    expect(CATEGORY_EMOJIS.length).toBeGreaterThan(10)
  })

  it('has budget chart colors', async () => {
    const { BUDGET_CHART_COLORS, OTHER_COLOR } = await import('@/lib/constants')
    expect(Array.isArray(BUDGET_CHART_COLORS)).toBe(true)
    expect(OTHER_COLOR).toBe('#9ca3af')
  })
})

describe('Goal service edge cases', () => {
  it('archiveGoal updates status', async () => {
    const { archiveGoal } = await import('@/lib/goal-service')
    const { db } = await import('@/lib/db')

    await db.savingGoals.clear()
    await db.savingGoals.add({
      id: 'g1', name: 'Test Goal', targetAmount: 1000000, currentSaved: 0,
      status: 'active', createdAt: '', updatedAt: '',
    })

    const result = await archiveGoal('g1')
    expect(result).toBeTruthy()
    expect(result!.status).toBe('archived')
  })

  it('unarchiveGoal restores status', async () => {
    const { unarchiveGoal } = await import('@/lib/goal-service')
    const { db } = await import('@/lib/db')

    await db.savingGoals.clear()
    await db.savingGoals.add({
      id: 'g2', name: 'Test', targetAmount: 1000, currentSaved: 0,
      status: 'archived', createdAt: '', updatedAt: '',
    })

    const result = await unarchiveGoal('g2')
    expect(result).toBeTruthy()
    expect(result!.status).toBe('active')
  })
})

describe('Category service edge cases', () => {
  it('getAllCategories filters by type', async () => {
    const { getAllCategories } = await import('@/lib/category-service')
    const { db } = await import('@/lib/db')

    await db.categories.clear()
    await db.categories.bulkAdd([
      { id: 'c1', name: 'Food', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
      { id: 'c2', name: 'Salary', type: 'income', icon: '💼', color: '#22c55e', isDefault: true },
    ])

    const expenses = await getAllCategories('expense')
    expect(expenses).toHaveLength(1)
    expect(expenses[0].name).toBe('Food')

    const incomes = await getAllCategories('income')
    expect(incomes).toHaveLength(1)
    expect(incomes[0].name).toBe('Salary')
  })
})
