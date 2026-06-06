'use client'

import { useEffect, useState } from 'react'
import { syncManager } from '@/lib/sync-manager'
import { db } from '@/lib/db'

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      // Clean duplicates before sync
      await deduplicateTransactions()

      if (navigator.onLine) {
        try {
          await syncManager.processQueue()
          await syncManager.pullChanges()
        } catch {
          // Silently fail, app works with local data
        }
      }
      setReady(true)
    }
    load()
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">SpendWise</h1>
            <p className="mt-2 text-sm text-muted-foreground">Preparing your data...</p>
          </div>
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="flex gap-4">
              <div className="h-24 flex-1 animate-pulse rounded-xl bg-muted" />
              <div className="h-24 flex-1 animate-pulse rounded-xl bg-muted" />
            </div>
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

async function deduplicateTransactions() {
  const all = await db.transactions.orderBy('createdAt').toArray()
  const seen = new Set<string>()
  const toDelete: string[] = []
  for (const tx of all) {
    const key = `${tx.type}-${tx.amount}-${tx.categoryId}-${tx.occurredAt}`
    if (seen.has(key)) {
      toDelete.push(tx.id)
    } else {
      seen.add(key)
    }
  }
  for (const id of toDelete) {
    await db.transactions.delete(id)
  }
}
