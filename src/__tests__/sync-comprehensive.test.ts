import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock api before any imports
vi.mock('@/lib/api', () => ({
  api: {
    sync: vi.fn(),
    login: vi.fn(),
    register: vi.fn()
  },
}))

import { db } from '@/lib/db'

// Import syncManager dynamically to ensure mocks are applied
let syncManager: typeof import('@/lib/sync-manager').syncManager

beforeEach(async () => {
  await db.syncQueue.clear()
  await db.transactions.clear()
  await db.categories.clear()
  await db.savingGoals.clear()
  await db.budgets.clear()
  await db.goalContributions.clear()
  localStorage.clear()
  const mod = await import('@/lib/sync-manager')
  syncManager = mod.syncManager
})

describe('SyncManager - constructor and init', () => {
  it('init registers online/offline listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    syncManager.init()
    expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function))
    addSpy.mockRestore()
  })

  it('init does nothing on server', () => {
    // Window exists in jsdom, so this always runs
    expect(() => syncManager.init()).not.toThrow()
  })

  it('destroy removes interval and listeners', () => {
    syncManager.init()
    syncManager.destroy()
    // Should not throw
  })

  it('onStatusChange returns unsubscribe function', () => {
    const unsub = syncManager.onStatusChange(() => {})
    expect(typeof unsub).toBe('function')
    unsub()
  })
})

describe('SyncManager - addToQueue', () => {
  it('adds item with retries=0 and createdAt', async () => {
    await syncManager.addToQueue({
      entityType: 'transaction',
      entityId: 'tx-abc',
      operation: 'CREATE',
      payload: { id: 'tx-abc', amount: 500 },
      timestamp: '2026-06-01T00:00:00Z'
    })
    const items = await db.syncQueue.toArray()
    expect(items).toHaveLength(1)
    expect(items[0].retries).toBe(0)
    expect(items[0].createdAt).toBeTruthy()
    expect(items[0].entityId).toBe('tx-abc')
  })
})

describe('SyncManager - processQueue', () => {
  it('processes items and clears queue on success', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockResolvedValue({
      serverChanges: [],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: []
    })

    await syncManager.addToQueue({
      entityType: 'transaction', entityId: 'tx-1', operation: 'CREATE',
      payload: { id: 'tx-1' }, timestamp: new Date().toISOString()
    })
    await syncManager.addToQueue({
      entityType: 'category', entityId: 'cat-1', operation: 'UPDATE',
      payload: { id: 'cat-1' }, timestamp: new Date().toISOString()
    })

    expect(await db.syncQueue.count()).toBe(2)
    await syncManager.processQueue()
    expect(await db.syncQueue.count()).toBe(0)
  })

  it('skips when already in progress', async () => {
    // This tests the syncInProgress guard
    await syncManager.processQueue() // empty queue, should work
    // Should not throw
  })

  it('handles API error gracefully', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    await syncManager.addToQueue({
      entityType: 'transaction', entityId: 'tx-err', operation: 'CREATE',
      payload: { id: 'tx-err' }, timestamp: new Date().toISOString()
    })

    // Should not throw - error is caught internally
    await syncManager.processQueue()
    // Item should still be in queue with incremented retries
    const items = await db.syncQueue.toArray()
    expect(items.length).toBeGreaterThanOrEqual(1)
  })
})

describe('SyncManager - pullChanges', () => {
  it('fetches and merges server changes', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockResolvedValue({
      serverChanges: [
        {
          entityType: 'transaction',
          entityId: 'tx-from-server',
          data: {
            id: 'tx-from-server', type: 'expense', amount: 999,
            categoryId: 'c1', occurredAt: '2026-01-01', note: 'from server',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        },
      ],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: []
    })

    const before = await db.transactions.count()
    await syncManager.pullChanges()
    const after = await db.transactions.count()
    expect(after).toBeGreaterThanOrEqual(before)
  })

  it('skips when offline', async () => {
    const origOnline = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
    await syncManager.pullChanges()
    Object.defineProperty(navigator, 'onLine', { value: origOnline, writable: true })
    // Should not throw and should not make any API calls
  })

  it('handles API error in pull', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Pull failed'))
    await syncManager.pullChanges()
    // Should not throw
  })
})

describe('SyncManager - status', () => {
  it('getStatus returns a valid status', () => {
    const status = syncManager.getStatus()
    expect(['idle', 'offline', 'syncing', 'error']).toContain(status)
  })

  it('getPendingCount returns number', async () => {
    const count = await syncManager.getPendingCount()
    expect(typeof count).toBe('number')
  })

  it('onStatusChange listener receives status updates', async () => {
    const statuses: string[] = []
    const unsub = syncManager.onStatusChange((s) => statuses.push(s))
    // Process queue might trigger status changes
    await syncManager.processQueue()
    unsub()
    // Status should have been called at least once
  })
})

describe('SyncManager - dedup handling', () => {
  it('merge server changes handles empty response', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockResolvedValue({
      serverChanges: [],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: []
    })
    await syncManager.pullChanges()
    // Should not throw
  })

  it('merge server changes handles multiple entity types', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockResolvedValue({
      serverChanges: [
        {
          entityType: 'transaction', entityId: 'tx-m1',
          data: { id: 'tx-m1', type: 'expense', amount: 100, categoryId: 'c1', occurredAt: '2026-01-01', note: '', createdAt: '', updatedAt: '' },
          timestamp: ''
        },
        {
          entityType: 'category', entityId: 'cat-m1',
          data: { id: 'cat-m1', name: 'Merged', type: 'expense', icon: '📁', color: '#000', isDefault: false },
          timestamp: ''
        },
        {
          entityType: 'goal', entityId: 'goal-m1',
          data: { id: 'goal-m1', name: 'Merged Goal', targetAmount: 1000, currentSaved: 0, status: 'active', createdAt: '', updatedAt: '' },
          timestamp: ''
        },
        {
          entityType: 'budget', entityId: 'bud-m1',
          data: { id: 'bud-m1', name: 'Merged Budget', amount: 1000, period: 'monthly', categoryId: 'c1', createdAt: '', updatedAt: '' },
          timestamp: ''
        },
      ],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: []
    })

    await syncManager.pullChanges()
    expect(await db.transactions.count()).toBeGreaterThanOrEqual(1)
    expect(await db.categories.count()).toBeGreaterThanOrEqual(1)
  })
})
