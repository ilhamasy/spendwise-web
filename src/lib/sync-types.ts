export interface SyncQueueItem {
  id?: number
  entityType: 'transaction' | 'category' | 'goal' | 'budget'
  entityId: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  payload: unknown
  timestamp: string
  createdAt: string
  retries: number
}

export interface SyncChange {
  entityType: string
  entityId: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  payload: unknown
  timestamp: string
}

export interface DataSyncResponse {
  serverChanges: Array<{
    entityType: string
    entityId: string
    data: unknown
    timestamp: string
    isDeleted?: boolean
  }>
  newSyncTimestamp: string
  conflicts: Array<{
    entityType: string
    entityId: string
    localChange: SyncChange
    serverChange: unknown
    resolution: 'local_wins' | 'server_wins'
  }>
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

export interface SyncMetadata {
  lastSyncedAt: string
  lastPulledAt: string
}
