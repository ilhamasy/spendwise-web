import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from '@/lib/db'

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
    getPendingCount: () => Promise.resolve(0),
    getStatus: () => 'idle',
    init: () => {},
    destroy: () => {},
    onStatusChange: () => () => {},
  },
}))

import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getRecentTransactions,
  getTotalIncome,
  getTotalExpense,
} from '@/lib/transaction-service'

beforeEach(async () => {
  await db.transactions.clear()
})

afterEach(async () => {
  await db.transactions.clear()
})

describe('transaction-service', () => {
  it('creates and retrieves a transaction', async () => {
    const tx = await createTransaction({
      type: 'expense',
      amount: 50000,
      categoryId: 'cat-1',
      occurredAt: '2026-06-01',
      note: 'Lunch',
    })

    expect(tx.id).toBeTruthy()
    expect(tx.amount).toBe(50000)
    expect(tx.createdAt).toBeTruthy()

    const found = await getTransactionById(tx.id)
    expect(found).toBeTruthy()
    expect(found!.note).toBe('Lunch')
  })

  it('gets all transactions sorted newest first', async () => {
    await createTransaction({ type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2026-01-01' })
    await createTransaction({ type: 'expense', amount: 200, categoryId: 'c1', occurredAt: '2026-06-01' })

    const all = await getAllTransactions()
    expect(all).toHaveLength(2)
    expect(all[0].amount).toBe(200) // newest first
    expect(all[1].amount).toBe(100)
  })

  it('gets recent transactions with limit', async () => {
    for (let i = 1; i <= 5; i++) {
      await createTransaction({
        type: 'expense', amount: i * 1000, categoryId: 'c1',
        occurredAt: `2026-01-${String(i).padStart(2, '0')}`,
      })
    }

    const recent = await getRecentTransactions(3)
    expect(recent).toHaveLength(3)
  }, 20000)

  it('updates a transaction', async () => {
    const tx = await createTransaction({
      type: 'expense', amount: 50000, categoryId: 'c1', occurredAt: '2026-06-01',
    })

    const updated = await updateTransaction(tx.id, { amount: 75000, note: 'Updated' })
    expect(updated!.amount).toBe(75000)
    expect(updated!.note).toBe('Updated')
  })

  it('returns undefined when updating non-existent transaction', async () => {
    const result = await updateTransaction('nonexistent', { amount: 100 })
    expect(result).toBeUndefined()
  })

  it('deletes a transaction', async () => {
    const tx = await createTransaction({
      type: 'expense', amount: 50000, categoryId: 'c1', occurredAt: '2026-06-01',
    })

    const deleted = await deleteTransaction(tx.id)
    expect(deleted).toBe(true)

    const found = await getTransactionById(tx.id)
    expect(found).toBeUndefined()
  })

  it('returns false when deleting non-existent transaction', async () => {
    const result = await deleteTransaction('nonexistent')
    expect(result).toBe(false)
  })

  it('calculates total income', async () => {
    await createTransaction({ type: 'income', amount: 100000, categoryId: 'c1', occurredAt: '2026-06-01' })
    await createTransaction({ type: 'income', amount: 50000, categoryId: 'c1', occurredAt: '2026-06-02' })
    await createTransaction({ type: 'expense', amount: 30000, categoryId: 'c2', occurredAt: '2026-06-01' })

    const total = await getTotalIncome()
    expect(total).toBe(150000)
  })

  it('calculates total expense', async () => {
    await createTransaction({ type: 'expense', amount: 30000, categoryId: 'c2', occurredAt: '2026-06-01' })
    await createTransaction({ type: 'expense', amount: 20000, categoryId: 'c2', occurredAt: '2026-06-02' })
    await createTransaction({ type: 'income', amount: 100000, categoryId: 'c1', occurredAt: '2026-06-01' })

    const total = await getTotalExpense()
    expect(total).toBe(50000)
  })
})
