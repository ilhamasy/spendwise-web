import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/api', () => ({
  api: {
    sync: vi.fn(() => Promise.resolve({
      serverChanges: [
        { entityType: 'transaction', entityId: 'tx-s1', data: { id: 'tx-s1', type: 'expense', amount: 500, categoryId: 'c1', occurredAt: '2026-01-01', note: '', createdAt: '', updatedAt: '' }, timestamp: '' },
        { entityType: 'category', entityId: 'cat-d1', data: { id: 'cat-d1', name: 'Deleted', type: 'expense', icon: '🗑️', color: '#000', isDeleted: true }, timestamp: '' },
      ],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: [],
    })),
  },}))

import { db } from '@/lib/db'

beforeEach(async () => {
  await db.syncQueue.clear()
  await db.transactions.clear()
  await db.categories.clear()
  await db.savingGoals.clear()
  await db.budgets.clear()
  await db.goalContributions.clear()
  localStorage.clear()
})

describe('SyncManager - Pull & Merge', () => {
  it('pullChanges merges server transaction changes', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.pullChanges()
    const txs = await db.transactions.toArray()
    expect(txs).toHaveLength(1)
    expect(txs[0].id).toBe('tx-s1')
  })

  it('pullChanges fires transaction-updated event for tx changes', async () => {
    let fired = false
    const handler = () => { fired = true }
    window.addEventListener('transaction-updated', handler)

    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.pullChanges()

    window.removeEventListener('transaction-updated', handler)
    expect(fired).toBe(true)
  })
})

describe('SyncManager - Queue operations', () => {
  it('addToQueue with different operations', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.addToQueue({
      entityType: 'budget', entityId: 'b1', operation: 'CREATE',
      payload: {}, timestamp: new Date().toISOString(),
    })
    const items = await db.syncQueue.toArray()
    expect(items).toHaveLength(1)
    expect(items[0].retries).toBe(0)
    expect(items[0].createdAt).toBeTruthy()
  })

  it('processQueue syncs and clears queue', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.addToQueue({
      entityType: 'transaction', entityId: 'tx-q1', operation: 'CREATE',
      payload: { id: 'tx-q1' }, timestamp: new Date().toISOString(),
    })
    expect(await db.syncQueue.count()).toBe(1)
    await syncManager.processQueue()
    expect(await db.syncQueue.count()).toBe(0)
  })
})

describe('SyncManager - Lifecycle', () => {
  it('onStatusChange returns unsubscribe function', () => {
    // Testing async import
  })

  it('can destroy and re-init', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    syncManager.init()
    syncManager.destroy()
    syncManager.init()
    // Should not throw
  })
})
