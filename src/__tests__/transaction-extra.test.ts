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
  createTransaction,
  getTransactionById,
  getTransactionsByDateRange,
  getTransactionsByMonth,
  getTransactionsByYear,
  updateTransaction,
  deleteTransaction,
} from '@/lib/transaction-service'

beforeEach(async () => {
  await db.transactions.clear()
})

describe('transaction-service - date filtering', () => {
  it('filters by date range', async () => {
    await db.transactions.bulkAdd([
      { id: 't1', type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2026-01-15', note: '', createdAt: '', updatedAt: '' },
      { id: 't2', type: 'expense', amount: 200, categoryId: 'c1', occurredAt: '2026-02-15', note: '', createdAt: '', updatedAt: '' },
      { id: 't3', type: 'expense', amount: 300, categoryId: 'c1', occurredAt: '2026-03-15', note: '', createdAt: '', updatedAt: '' },
    ])
    const result = await getTransactionsByDateRange('2026-01-01', '2026-02-28')
    expect(result).toHaveLength(2)
  })

  it('filters by month', async () => {
    await db.transactions.bulkAdd([
      { id: 't1', type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2026-01-15', note: '', createdAt: '', updatedAt: '' },
      { id: 't2', type: 'expense', amount: 200, categoryId: 'c1', occurredAt: '2026-02-15', note: '', createdAt: '', updatedAt: '' },
    ])
    const result = await getTransactionsByMonth(2026, 1)
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(100)
  })

  it('filters by year', async () => {
    await db.transactions.bulkAdd([
      { id: 't1', type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2025-06-01', note: '', createdAt: '', updatedAt: '' },
      { id: 't2', type: 'expense', amount: 200, categoryId: 'c1', occurredAt: '2026-06-01', note: '', createdAt: '', updatedAt: '' },
    ])
    const result = await getTransactionsByYear(2026)
    expect(result).toHaveLength(1)
  })
})

describe('transaction-service - CRUD edge cases', () => {
  it('returns undefined for non-existent transaction', async () => {
    const tx = await getTransactionById('nonexistent')
    expect(tx).toBeUndefined()
  })

  it('update returns undefined for non-existent', async () => {
    const result = await updateTransaction('nonexistent', { amount: 100 })
    expect(result).toBeUndefined()
  })

  it('delete returns false for non-existent', async () => {
    const result = await deleteTransaction('nonexistent')
    expect(result).toBe(false)
  })
})
