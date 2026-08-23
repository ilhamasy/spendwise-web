import { db } from '@/lib/db'
import { api } from '@/lib/api'
import type { SyncQueueItem, DataSyncResponse, SyncStatus, SyncMetadata } from '@/lib/sync-types'

type StatusListener = (status: SyncStatus) => void

const SYNC_META_KEY = 'spendwise-sync-meta'

export function validateSyncPayloadIntegrity(item: Partial<SyncQueueItem>): boolean {
  if (!item || typeof item !== 'object') return false
  if (!item.operation || !['CREATE', 'UPDATE', 'DELETE'].includes(item.operation)) return false
  if (!item.entityType || !['transaction', 'category', 'budget', 'goal'].includes(item.entityType)) return false
  if (!item.entityId || typeof item.entityId !== 'string') return false
  return true
}

class SyncManager {
  private syncInProgress = false
  private maxRetries = 3
  private listeners: Array<StatusListener> = []
  private status: SyncStatus = 'idle'
  private intervalId: ReturnType<typeof setInterval> | null = null

  init() {
    if (typeof window === 'undefined') return
    window.addEventListener('online', () => this.onOnline())
    this.intervalId = setInterval(() => this.tick(), 30000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.tick()
    })
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId)
    this.listeners = []
  }

  private getMeta(): SyncMetadata {
    const raw = localStorage.getItem(SYNC_META_KEY)
    return raw ? JSON.parse(raw) : { lastSyncedAt: '', lastPulledAt: '' }
  }

  private setMeta(meta: Partial<SyncMetadata>) {
    const current = this.getMeta()
    localStorage.setItem(SYNC_META_KEY, JSON.stringify({ ...current, ...meta }))
  }

  onStatusChange(listener: StatusListener) {
    this.listeners.push(listener)
    return () => { this.listeners = this.listeners.filter((l) => l !== listener) }
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
    await db.syncQueue.add({ ...item, retries: 0, createdAt: new Date().toISOString() })
  }

  private async onOnline() {
    this.setStatus('idle')
    await this.processQueue()
    await this.pullChanges()
  }

  private async tick() {
    if (!navigator.onLine || this.syncInProgress) return
    await this.processQueue()
    await this.pullChanges()
  }

  private hasAuthToken(): boolean {
    if (typeof document === 'undefined') return false
    return /(?:^|; )(?:spendwise-access-token|spendwise-token|spendwise-session)=/.test(document.cookie)
  }

  async processQueue(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return
    const items = await db.syncQueue.orderBy('createdAt').toArray()
    if (items.length === 0) {
      this.setStatus('idle')
      return
    }

    this.syncInProgress = true
    this.setStatus('syncing')

    try {
      const changes = items.map((item) => ({
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload,
        timestamp: item.timestamp,
      }))

      const meta = this.getMeta()
      await api.sync(meta.lastSyncedAt, changes)
      this.setMeta({ lastSyncedAt: new Date().toISOString() })

      for (const item of items) {
        if (item.id != null) await db.syncQueue.delete(item.id)
      }
    } catch {
      for (const item of await db.syncQueue.toArray()) {
        if (item.retries >= this.maxRetries) {
          if (item.id != null) await db.syncQueue.delete(item.id)
        } else if (item.id != null) {
          await db.syncQueue.update(item.id, { retries: item.retries + 1 })
        }
      }
    } finally {
      this.syncInProgress = false
      this.setStatus('idle')
    }
  }

  async pullChanges(): Promise<void> {
    if (!navigator.onLine || this.syncInProgress) return
    this.syncInProgress = true

    try {
      const meta = this.getMeta()
      const changes: unknown[] = []
      const response = await api.sync(meta.lastPulledAt, changes)

      await this.mergeServerChanges(response)
      this.setMeta({ lastPulledAt: response.newSyncTimestamp })
    } catch {
      // Silently fail
    } finally {
      this.syncInProgress = false
      this.setStatus('idle')
    }
  }

  private async mergeServerChanges(response: DataSyncResponse) {
    let hasTxChanges = false
    for (const change of response.serverChanges) {
      try {
        if ((change as { isDeleted?: boolean }).isDeleted) {
          await this.handleDeleted(change)
          continue
        }

        switch (change.entityType) {
          case 'transaction':
            await this.upsert('transactions', change)
            hasTxChanges = true
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
        // Skip
      }
    }
    if (hasTxChanges) {
      window.dispatchEvent(new Event('transaction-updated'))
    }
  }

  private async handleDeleted(change: { entityType: string; entityId: string; data?: unknown }) {
    const tableMap: Record<string, string> = {
      transaction: 'transactions',
      category: 'categories',
      goal: 'savingGoals',
      budget: 'budgets',
    }
    const table = tableMap[change.entityType]
    if (!table) return

    const tableRef = (db as unknown as Record<string, { get: (id: string) => Promise<unknown>; delete: (id: string) => Promise<void>; put: (data: unknown) => Promise<void> }>)[table]
    if (!tableRef) return

    // Never hard-delete categories — always archive for transaction references
    if (change.entityType === 'category') {
      const existing = await tableRef.get(change.entityId).catch(() => null)
      const changeData = change.data as Record<string, unknown>
      const data = existing ? { ...(existing as Record<string, unknown>), ...changeData } : { ...changeData }
      data.status = 'archived'
      data.isDeleted = true
      data.id = change.entityId
      await tableRef.put(data)
      return
    }

    await tableRef.delete(change.entityId).catch(() => {})
  }

  private async upsert(table: string, change: { entityId: string; data: unknown }) {
    const tableRef = (db as unknown as Record<string, { get: (id: string) => Promise<unknown>; put: (data: unknown) => Promise<void>; toArray?: () => Promise<unknown[]> }>)[table]
    if (!tableRef) return

    const existing = await tableRef.get(change.entityId).catch(() => null)
    const changeData = change.data as Record<string, unknown>

    if (existing) {
      const existingData = existing as Record<string, unknown>
      const serverTime = new Date((changeData.updatedAt as string) || '').getTime()
      const localTime = new Date((existingData.updatedAt as string) || '0').getTime()

      if (serverTime > localTime || !existingData.updatedAt) {
        const merged = { ...existingData, ...changeData }
        if (table === 'categories' && existingData.status === 'archived' && !changeData.status) {
          merged.status = 'archived'
        }
        await tableRef.put(merged)
      }
    } else {
      if (table === 'transactions' && tableRef.toArray) {
        const all = await tableRef.toArray()
        const matches = (all as Record<string, unknown>[]).filter((t: Record<string, unknown>) =>
          t.type === changeData.type &&
          t.amount === changeData.amount &&
          t.categoryId === changeData.categoryId &&
          t.occurredAt === changeData.occurredAt &&
          (t.note || '') === (changeData.note || '')
        )
        if (matches.length > 0) return
      }
      await tableRef.put(changeData)
    }
  }

  async getPendingCount(): Promise<number> {
    return db.syncQueue.count()
  }
}

export const syncManager = new SyncManager()
