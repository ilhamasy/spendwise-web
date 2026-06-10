import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
  },
}))

import {
  getAllBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSpent,
  getBudgetWithSpent,
} from '@/lib/budget-service'

beforeEach(async () => {
  await db.budgets.clear()
  await db.transactions.clear()
})

describe('budget-service', () => {
  it('creates and retrieves a budget', async () => {
    const b = await createBudget({
      name: 'Food Budget',
      amount: 2000000,
      period: 'monthly',
      categoryId: 'cat-1',
    })
    expect(b.id).toBeTruthy()
    expect(b.amount).toBe(2000000)

    const all = await getAllBudgets()
    expect(all).toHaveLength(1)
  })

  it('updates a budget', async () => {
    const b = await createBudget({
      name: 'Food', amount: 1000000, period: 'monthly', categoryId: 'cat-1',
    })
    const updated = await updateBudget(b.id, { name: 'Updated', amount: 2000000 })
    expect(updated!.name).toBe('Updated')
    expect(updated!.amount).toBe(2000000)
  })

  it('returns undefined when updating non-existent', async () => {
    const result = await updateBudget('nonexistent', { name: 'X' })
    expect(result).toBeUndefined()
  })

  it('deletes a budget', async () => {
    const b = await createBudget({
      name: 'Food', amount: 1000000, period: 'daily', categoryId: 'cat-1',
    })
    const result = await deleteBudget(b.id)
    expect(result).toBe(true)

    const all = await getAllBudgets()
    expect(all).toHaveLength(0)
  })

  it('returns false when deleting non-existent', async () => {
    const result = await deleteBudget('nonexistent')
    expect(result).toBe(false)
  })

  it('calculates spent for daily period', async () => {
    const today = new Date().toISOString().split('T')[0]
    await db.transactions.add({
      id: 't1', type: 'expense', amount: 50000, categoryId: 'cat-1',
      occurredAt: today, note: '', createdAt: '', updatedAt: '',
    })
    const spent = await getBudgetSpent({
      id: 'b1', name: '', amount: 100000, period: 'daily', categoryId: 'cat-1',
      createdAt: '', updatedAt: '',
    })
    expect(spent).toBe(50000)
  })

  it('calculates budget with spent and progress', async () => {
    const today = new Date().toISOString().split('T')[0]
    await db.transactions.add({
      id: 't1', type: 'expense', amount: 30000, categoryId: 'cat-1',
      occurredAt: today, note: '', createdAt: '', updatedAt: '',
    })
    const result = await getBudgetWithSpent({
      id: 'b1', name: 'Test', amount: 100000, period: 'monthly', categoryId: 'cat-1',
      createdAt: '', updatedAt: '',
    })
    expect(result.spent).toBe(30000)
    expect(result.remaining).toBe(70000)
    expect(result.progress).toBe(30)
  })
})
