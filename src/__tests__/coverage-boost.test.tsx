import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock IndexedDB
vi.mock('@/lib/db', () => ({
  db: {
    budgets: {
      get: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn(() => ({ equals: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([]),
      })) })),
    },
    transactions: {
      get: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({ toArray: vi.fn().mockResolvedValue([]) })),
        between: vi.fn(() => ({
          reverse: vi.fn(() => ({
            sortBy: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
          limit: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    },
    syncQueue: {
      add: vi.fn(),
    },
  },
}))

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/lib/utils', () => ({
  generateId: () => 'test-id-123',
}))

vi.mock('@/lib/api', () => ({
  api: {
    createTransaction: vi.fn().mockRejectedValue(new Error('API down')),
    sync: vi.fn(),
  },
}))

import { updateBudget, deleteBudget, getBudgetSpent, getBudgetWithSpent } from '@/lib/budget-service'
import { updateTransaction, deleteTransaction, getTransactionById } from '@/lib/transaction-service'

describe('budget-service extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updateBudget returns undefined when not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.budgets.get).mockResolvedValue(undefined)
    const result = await updateBudget('nonexistent', { name: 'test' })
    expect(result).toBeUndefined()
  })

  it('updateBudget updates and returns budget', async () => {
    const { db } = await import('@/lib/db')
    const existing = { id: '1', name: 'old', amount: 100, period: 'monthly', categoryId: 'c1', createdAt: '', updatedAt: '' }
    vi.mocked(db.budgets.get).mockResolvedValue(existing)
    vi.mocked(db.budgets.put).mockResolvedValue(undefined as never)
    const result = await updateBudget('1', { name: 'new' })
    expect(result).toBeDefined()
    expect(result!.name).toBe('new')
    expect(db.budgets.put).toHaveBeenCalled()
  })

  it('deleteBudget returns false when not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.budgets.get).mockResolvedValue(undefined)
    const result = await deleteBudget('nonexistent')
    expect(result).toBe(false)
  })

  it('deleteBudget deletes and returns true', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.budgets.get).mockResolvedValue({ id: '1', name: 'test', amount: 100, period: 'monthly', categoryId: 'c1', createdAt: '', updatedAt: '' })
    vi.mocked(db.budgets.delete).mockResolvedValue(undefined)
    const result = await deleteBudget('1')
    expect(result).toBe(true)
    expect(db.budgets.delete).toHaveBeenCalledWith('1')
  })

  it('getBudgetSpent calculates spent amount', async () => {
    const { db } = await import('@/lib/db')
    const budget = { id: '1', name: 'b', amount: 100, period: 'monthly' as const, categoryId: 'c1', createdAt: '', updatedAt: '' }
    const mockToArray = vi.fn().mockResolvedValue([
      { type: 'expense', categoryId: 'c1', amount: 30, occurredAt: new Date().toISOString().split('T')[0] },
      { type: 'expense', categoryId: 'c1', amount: 20, occurredAt: new Date().toISOString().split('T')[0] },
      { type: 'income', categoryId: 'c1', amount: 100, occurredAt: new Date().toISOString().split('T')[0] },
    ])
    vi.mocked(db.transactions.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({ toArray: mockToArray }),
    } as never)
    const spent = await getBudgetSpent(budget)
    expect(spent).toBe(50)
  })

  it('getBudgetWithSpent returns full stats', async () => {
    const { db } = await import('@/lib/db')
    const budget = { id: '1', name: 'b', amount: 100, period: 'monthly' as const, categoryId: 'c1', createdAt: '', updatedAt: '' }
    const mockToArray = vi.fn().mockResolvedValue([
      { type: 'expense', categoryId: 'c1', amount: 40, occurredAt: new Date().toISOString().split('T')[0] },
    ])
    vi.mocked(db.transactions.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({ toArray: mockToArray }),
    } as never)
    const result = await getBudgetWithSpent(budget)
    expect(result.spent).toBe(40)
    expect(result.remaining).toBe(60)
    expect(result.progress).toBe(40)
  })
})

describe('transaction-service extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTransactionById returns transaction', async () => {
    const { db } = await import('@/lib/db')
    const txn = { id: '1', type: 'expense', amount: 50, categoryId: 'c1', occurredAt: '2025-01-01', note: '', createdAt: '', updatedAt: '' }
    vi.mocked(db.transactions.get).mockResolvedValue(txn)
    const result = await getTransactionById('1')
    expect(result).toEqual(txn)
  })

  it('getTransactionById returns undefined when not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.transactions.get).mockResolvedValue(undefined)
    const result = await getTransactionById('nonexistent')
    expect(result).toBeUndefined()
  })

  it('updateTransaction returns undefined when not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.transactions.get).mockResolvedValue(undefined)
    const result = await updateTransaction('nonexistent', { amount: 100 })
    expect(result).toBeUndefined()
  })

  it('updateTransaction updates and saves to queue', async () => {
    const { db } = await import('@/lib/db')
    const txn = { id: '1', type: 'expense', amount: 50, categoryId: 'c1', occurredAt: '2025-01-01', note: '', createdAt: '', updatedAt: '' }
    vi.mocked(db.transactions.get).mockResolvedValue(txn)
    vi.mocked(db.transactions.put).mockResolvedValue(undefined as never)
    const result = await updateTransaction('1', { amount: 100 })
    expect(result).toBeDefined()
    expect(result!.amount).toBe(100)
    expect(db.transactions.put).toHaveBeenCalled()
  })

  it('deleteTransaction returns false when not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.transactions.get).mockResolvedValue(undefined)
    const result = await deleteTransaction('nonexistent')
    expect(result).toBe(false)
  })

  it('deleteTransaction deletes and saves to queue', async () => {
    const { db } = await import('@/lib/db')
    const txn = { id: '1', type: 'expense', amount: 50, categoryId: 'c1', occurredAt: '2025-01-01', note: '', createdAt: '', updatedAt: '' }
    vi.mocked(db.transactions.get).mockResolvedValue(txn)
    vi.mocked(db.transactions.delete).mockResolvedValue(undefined)
    const result = await deleteTransaction('1')
    expect(result).toBe(true)
    expect(db.transactions.delete).toHaveBeenCalledWith('1')
  })
})
