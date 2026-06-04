import { db } from '@/lib/db'
import { api } from '@/lib/api'
import type { SyncQueueItem, DataSyncResponse, SyncStatus } from '@/lib/sync-types'

type StatusListener = (status: SyncStatus) => void

export class SyncManager {
  private syncInProgress = false
  private maxRetries = 3
  private listeners: Array<StatusListener> = []
  private status: SyncStatus = 'idle'

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window === 'undefined') return
    window.addEventListener('online', () => this.onOnline())
  }

  onStatusChange(listener: StatusListener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private setStatus(status: SyncStatus) {
    this.status = status
    this.listeners.forEach((l) => l(status))
  }

  getStatus(): SyncStatus {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline'
    return this.status
  }

  async addToQueue(item: Omit<SyncQueueItem, 'id' | 'retries' | 'createdAt'>) {
    await db.syncQueue.add({
      ...item,
      retries: 0,
      createdAt: new Date().toISOString(),
    })
    if (navigator.onLine && !this.syncInProgress) {
      this.processQueue()
    }
  }

  private async onOnline() {
    this.setStatus('idle')
    await this.pullFromServer()
    await this.processQueue()
  }

  async pullFromServer() {
    if (!navigator.onLine || this.syncInProgress) return
    this.syncInProgress = true
    this.setStatus('syncing')

    try {
      const lastSyncAt = localStorage.getItem('spendwise-lastSync') || ''
      const changes: unknown[] = []

      const response = await api.sync(lastSyncAt, changes)
      await this.mergeServerChanges(response)
      localStorage.setItem('spendwise-lastSync', response.newSyncTimestamp)
    } catch (_err) {
      // Silently fail, will retry later
    } finally {
      this.syncInProgress = false
      this.setStatus('idle')
    }
  }

  async processQueue() {
    if (!navigator.onLine || this.syncInProgress) return
    this.syncInProgress = true
    this.setStatus('syncing')

    try {
      const items = await db.syncQueue.orderBy('createdAt').toArray()
      if (items.length === 0) {
        this.setStatus('idle')
        this.syncInProgress = false
        return
      }

      const lastSyncAt = localStorage.getItem('spendwise-lastSync') || ''
      const changes = items.map((item) => ({
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload,
        timestamp: item.timestamp,
      }))

      const response = await api.sync(lastSyncAt, changes)

      const succeededIds = new Set<number>()
      for (const conflict of response.conflicts) {
        const match = items.find(
          (i) => i.entityType === conflict.entityType && i.entityId === conflict.entityId
        )
        if (match && match.id != null) {
          if (conflict.resolution === 'server_wins') {
            succeededIds.add(match.id)
          } else {
            succeededIds.add(match.id)
          }
        }
      }

      for (const item of items) {
        if (item.retries >= this.maxRetries) {
          if (item.id != null) await db.syncQueue.delete(item.id)
          continue
        }
        if (succeededIds.has(item.id!) || !conflictItems(items, response).includes(item.id!)) {
          if (item.id != null) await db.syncQueue.delete(item.id)
        } else {
          if (item.id != null) {
            await db.syncQueue.update(item.id, { retries: item.retries + 1 })
          }
        }
      }

      await this.mergeServerChanges(response)
      localStorage.setItem('spendwise-lastSync', response.newSyncTimestamp)
    } catch (_err) {
      for (const item of await db.syncQueue.toArray()) {
        if (item.retries >= this.maxRetries) {
          if (item.id != null) await db.syncQueue.delete(item.id)
        } else if (item.id != null) {
          await db.syncQueue.update(item.id, { retries: item.retries + 1 })
        }
      }
      this.setStatus('error')
    } finally {
      this.syncInProgress = false
      if (this.status !== 'error') this.setStatus('idle')
    }
  }

  private async mergeServerChanges(response: DataSyncResponse) {
    for (const change of response.serverChanges) {
      try {
        switch (change.entityType) {
          case 'transaction':
            await this.upsert('transactions', change)
            break
          case 'category':
            await this.upsert('categories', change)
            break
          case 'goal':
            await this.upsert('savingGoals', change)
            break
          case 'budget':
            await this.upsert('budgets', change)
            break
        }
      } catch {
        // Skip failed merges
      }
    }
  }

  private async upsert(table: string, change: { entityId: string; data: unknown }) {
    const tableRef = (db as unknown as Record<string, { get: (id: string) => Promise<unknown>; put: (data: unknown) => Promise<unknown> }>)[table]
    if (!tableRef) return

    const existing = await tableRef.get(change.entityId).catch(() => null)
    if (existing) {
      await tableRef.put({ ...(existing as object), ...(change.data as object) })
    } else {
      await tableRef.put(change.data)
    }
  }

  async getPendingCount(): Promise<number> {
    return db.syncQueue.count()
  }
}

function conflictItems(items: SyncQueueItem[], _response: DataSyncResponse): number[] {
  return items.filter((i) => i.retries >= 3).map((i) => i.id!)
}

export const syncManager = new SyncManager()
