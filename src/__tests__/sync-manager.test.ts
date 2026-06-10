import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/api', () => ({
  api: {
    sync: () => Promise.resolve({
      serverChanges: [],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: [],
    }),
    login: () => Promise.reject(new Error('offline')),
    register: () => Promise.reject(new Error('offline')),
  },
  setAuthToken: () => {},
  getAuthToken: () => null,
}))

import { db } from '@/lib/db'

beforeEach(async () => {
  await db.syncQueue.clear()
  await db.transactions.clear()
  localStorage.clear()
})

describe('SyncManager - Core', () => {
  it('addToQueue adds item to sync queue', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.addToQueue({
      entityType: 'transaction',
      entityId: 'tx-1',
      operation: 'CREATE',
      payload: { id: 'tx-1' },
      timestamp: new Date().toISOString(),
    })
    const items = await db.syncQueue.toArray()
    expect(items).toHaveLength(1)
    expect(items[0].entityId).toBe('tx-1')
  })

  it('getPendingCount returns correct count', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.addToQueue({
      entityType: 'transaction', entityId: 'tx-1', operation: 'CREATE',
      payload: {}, timestamp: new Date().toISOString(),
    })
    await syncManager.addToQueue({
      entityType: 'category', entityId: 'cat-1', operation: 'CREATE',
      payload: {}, timestamp: new Date().toISOString(),
    })
    const count = await syncManager.getPendingCount()
    expect(count).toBe(2)
  })

  it('getStatus returns status', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    const status = syncManager.getStatus()
    expect(['idle', 'offline', 'syncing', 'error']).toContain(status)
  })

  it('processQueue with empty queue does nothing', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.processQueue()
    const count = await db.syncQueue.count()
    expect(count).toBe(0)
  })

  it('processQueue with items clears them on success', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.addToQueue({
      entityType: 'transaction', entityId: 'tx-1', operation: 'CREATE',
      payload: { id: 'tx-1' }, timestamp: new Date().toISOString(),
    })
    await syncManager.processQueue()
    const count = await db.syncQueue.count()
    expect(count).toBe(0)
  })

  it('pullChanges handles empty response', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.pullChanges()
    const count = await db.transactions.count()
    expect(count).toBe(0)
  })

  it('onStatusChange registers and returns unsubscribe', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    const unsubscribe = syncManager.onStatusChange(() => {})
    expect(typeof unsubscribe).toBe('function')
    unsubscribe()
  })

  it('init sets up event listeners', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    syncManager.init()
    // Should not throw
  })

  it('destroy cleans up', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    syncManager.destroy()
    // Should not throw
  })
})

describe('SyncManager - Queue dedup', () => {
  it('handles multiple items of different types', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.addToQueue({
      entityType: 'transaction', entityId: 't1', operation: 'CREATE',
      payload: {}, timestamp: new Date().toISOString(),
    })
    await syncManager.addToQueue({
      entityType: 'category', entityId: 'c1', operation: 'UPDATE',
      payload: {}, timestamp: new Date().toISOString(),
    })
    await syncManager.addToQueue({
      entityType: 'goal', entityId: 'g1', operation: 'DELETE',
      payload: {}, timestamp: new Date().toISOString(),
    })
    const items = await db.syncQueue.toArray()
    expect(items).toHaveLength(3)
    expect(items.map((i) => i.operation)).toEqual(['CREATE', 'UPDATE', 'DELETE'])
  })
})
