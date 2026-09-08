import { describe, it, expect, beforeEach, vi } from 'vitest'

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

import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/currency'
import { cn, generateId } from '@/lib/utils'

describe('Currency', () => {
  it('formats IDR correctly', () => {
    expect(formatCurrency(50000)).toContain('Rp')
    expect(formatCurrency(1000000)).toContain('1.000.000')
  })
})

describe('Utils - cn', () => {
  it('joins classes', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', false && 'b')).toBe('a')
  })
})

describe('Utils - generateId', () => {
  it('returns UUID format', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/)
  })
})

describe('DB Operations', () => {
  beforeEach(async () => {
    await db.transactions.clear()
  })

  it('bulkAdd and count', async () => {
    await db.transactions.bulkAdd([
      { id: 't1', type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2026-01-01', note: '', createdAt: '', updatedAt: '' },
      { id: 't2', type: 'income', amount: 200, categoryId: 'c1', occurredAt: '2026-01-02', note: '', createdAt: '', updatedAt: '' },
    ])
    const count = await db.transactions.count()
    expect(count).toBe(2)
  })

  it('filters by type', async () => {
    await db.transactions.bulkAdd([
      { id: 't1', type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2026-01-01', note: '', createdAt: '', updatedAt: '' },
      { id: 't2', type: 'income', amount: 200, categoryId: 'c1', occurredAt: '2026-01-02', note: '', createdAt: '', updatedAt: '' },
    ])
    const expenses = await db.transactions.where('type').equals('expense').toArray()
    expect(expenses).toHaveLength(1)
  })
})
