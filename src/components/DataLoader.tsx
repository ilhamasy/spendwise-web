'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncManager } from '@/lib/sync-manager'
import { db } from '@/lib/db'

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Syncing your data...')

  useEffect(() => {
    async function load() {
      if (!navigator.onLine) {
        setReady(true)
        return
      }

      let retries = 0
      while (retries < 3) {
        try {
          setStatus('Pulling data from server...')
          await syncManager.pullFromServer()
          await syncManager.processQueue()

          const count = await db.transactions.count()
          if (count > 0) {
            setReady(true)
            return
          }
        } catch {
          // retry
        }
        retries++
        if (retries < 3) {
          setStatus(`Syncing... (attempt ${retries + 1}/3)`)
          await new Promise((r) => setTimeout(r, 2000))
        }
      }

      setError('Failed to sync data. Please login again.')
    }
    load()
  }, [])

  useEffect(() => {
    if (error) {
      localStorage.setItem('spendwise-login-error', error)
      router.push('/auth/login')
    }
  }, [error, router])

  if (!ready && !error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">SpendWise</h1>
            <p className="mt-2 text-sm text-muted-foreground">{status}</p>
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
