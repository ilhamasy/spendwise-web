'use client'

import { useEffect, useState } from 'react'
import { syncManager } from '@/lib/sync-manager'
import { db } from '@/lib/db'

const USER_KEY = 'spendwise-current-user'

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      const sessionId = localStorage.getItem('spendwise-session')
      const storedUser = localStorage.getItem(USER_KEY)
      if (sessionId && storedUser !== sessionId) {
        localStorage.setItem(USER_KEY, sessionId)
        await db.transactions.clear()
        await db.categories.clear()
        await db.savingGoals.clear()
        await db.goalContributions.clear()
        await db.budgets.clear()
        await db.syncQueue.clear()
      }

      await deduplicateTransactions()
      await deduplicateGoals()
      await migrateTimestamps()

      if (navigator.onLine) {
        try {
          await syncManager.processQueue()
          await syncManager.pullChanges()
        } catch {
          // Silently fail
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
    const key = `${tx.type}-${tx.amount}-${tx.categoryId}-${tx.occurredAt}-${tx.note || ''}`
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

async function deduplicateGoals() {
  const all = await db.savingGoals.orderBy('createdAt').toArray()
  const seen = new Set<string>()
  const toDelete: string[] = []
  for (const g of all) {
    const key = `${g.name}-${g.targetAmount}-${g.status}`
    if (seen.has(key)) {
      toDelete.push(g.id)
      await db.goalContributions.where('goalId').equals(g.id).delete()
    } else {
      seen.add(key)
    }
  }
  for (const id of toDelete) {
    await db.savingGoals.delete(id)
  }
}

async function migrateTimestamps() {
  const now = new Date().toISOString()
  const tables = ['transactions', 'savingGoals', 'budgets'] as const
  for (const table of tables) {
    const tableRef = (db as unknown as Record<string, { toArray: () => Promise<unknown[]>; put: (data: unknown) => Promise<void> }>)[table]
    if (!tableRef) continue
    const all = await tableRef.toArray()
    for (const item of all as { updatedAt?: string }[]) {
      if (!item.updatedAt) {
        item.updatedAt = now
        await tableRef.put(item)
      }
    }
  }
}
