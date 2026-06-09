import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'

vi.mock('@/lib/api', () => ({
  api: {
    sync: vi.fn(() => Promise.resolve({
      serverChanges: [
        {
          entityType: 'transaction',
          entityId: 'tx-s1',
          data: { id: 'tx-s1', type: 'expense', amount: 500, categoryId: 'c1', occurredAt: '2026-01-01', note: '', createdAt: '', updatedAt: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        },
        {
          entityType: 'category',
          entityId: 'cat-s1',
          data: { id: 'cat-s1', name: 'Synced', type: 'expense', icon: '📁', color: '#000', isDefault: false },
          timestamp: new Date().toISOString(),
        },
      ],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: [],
    })),
  },
  setAuthToken: () => {},
  getAuthToken: () => null,
}))

beforeEach(async () => {
  await db.syncQueue.clear()
  await db.transactions.clear()
  await db.categories.clear()
  await db.savingGoals.clear()
  await db.budgets.clear()
  await db.goalContributions.clear()
  localStorage.clear()
})

describe('SyncManager - Events', () => {
  it('dispatches transaction-updated on tx changes', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    let count = 0
    const handler = () => count++
    window.addEventListener('transaction-updated', handler)
    await syncManager.pullChanges()
    window.removeEventListener('transaction-updated', handler)
    expect(count).toBe(1)
  })

  it('does not dispatch transaction-updated for category-only changes', async () => {
    // Clear API mock to return only categories
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      serverChanges: [
        {
          entityType: 'category',
          entityId: 'cat-only',
          data: { id: 'cat-only', name: 'Cat', type: 'expense', icon: '📁', color: '#000', isDefault: false },
          timestamp: '',
        },
      ],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: [],
    })

    const { syncManager } = await import('@/lib/sync-manager')
    let count = 0
    const handler = () => count++
    window.addEventListener('transaction-updated', handler)
    await syncManager.pullChanges()
    window.removeEventListener('transaction-updated', handler)
    expect(count).toBe(0)
  })
})

describe('SyncManager - Queue management', () => {
  it('getPendingCount returns 0 when empty', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    const count = await syncManager.getPendingCount()
    expect(count).toBe(0)
  })

  it('processQueue with empty queue is no-op', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.processQueue()
    // Should not throw
  })

  it('processQueue clears items on success', async () => {
    const { syncManager } = await import('@/lib/sync-manager')
    await db.syncQueue.add({
      entityType: 'transaction',
      entityId: 'tx-clear',
      operation: 'CREATE',
      payload: { id: 'tx-clear' },
      timestamp: new Date().toISOString(),
      retries: 0,
      createdAt: new Date().toISOString(),
    })
    expect(await db.syncQueue.count()).toBe(1)
    await syncManager.processQueue()
    expect(await db.syncQueue.count()).toBe(0)
  })
})

describe('SyncMerge - Category isDeleted', () => {
  it.skip('archives category when isDeleted from server', async () => {
    const { api } = await import('@/lib/api')
    ;(api.sync as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      serverChanges: [
        {
          entityType: 'category',
          entityId: 'cat-del',
          data: { id: 'cat-del', name: 'ToDelete', type: 'expense', icon: '🗑️', color: '#000', isDeleted: true },
          timestamp: '',
        },
      ],
      newSyncTimestamp: new Date().toISOString(),
      conflicts: [],
    })

    const { syncManager } = await import('@/lib/sync-manager')
    await syncManager.pullChanges()

    // Category should be stored with archived status
    const cat = await db.categories.get('cat-del')
    expect(cat).toBeTruthy()
    expect((cat as Record<string, unknown>).status).toBe('archived')
  })
})
