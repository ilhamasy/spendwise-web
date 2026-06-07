'use client'

import { useEffect, useState, useCallback } from 'react'
import { syncManager } from '@/lib/sync-manager'
import type { SyncStatus } from '@/lib/sync-types'

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus())
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    syncManager.init()

    const unsubscribe = syncManager.onStatusChange((s) => {
      setStatus(s)
      if (s === 'idle' || s === 'error') {
        syncManager.getPendingCount().then(setPendingCount)
      }
    })

    syncManager.getPendingCount().then(setPendingCount)

    if (navigator.onLine) {
      syncManager.processQueue().then(() => syncManager.pullChanges())
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const syncNow = useCallback(() => {
    syncManager.processQueue()
  }, [])

  return { status, pendingCount, syncNow }
}
