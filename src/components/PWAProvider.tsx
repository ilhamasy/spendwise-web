'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Download, RefreshCw, AlertCircle, Cloud } from 'lucide-react'
import { syncManager } from '@/lib/sync-manager'
import { useSync } from '@/lib/use-sync'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissedInstall, setDismissedInstall] = useState(false)
  const { status, pendingCount, syncNow } = useSync()

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    const goOffline = () => setIsOffline(true)
    const goOnline = () => {
      setIsOffline(false)
      syncManager.pullFromServer()
      syncManager.processQueue()
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    const handleInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!dismissedInstall) setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handleInstall)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('beforeinstallprompt', handleInstall)
    }
  }, [dismissedInstall])

  async function handleInstall() {
    if (!deferredPrompt) return
    const promptEvent = deferredPrompt as BeforeInstallPromptEvent
    promptEvent.prompt()
    const result = await promptEvent.userChoice
    if (result.outcome === 'accepted') setShowInstall(false)
    setDeferredPrompt(null)
  }

  return (
    <>
      {children}

      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-medium text-white">
          <WifiOff className="h-3 w-3" />
          You are offline. Changes will sync when reconnected.
        </div>
      )}

      {!isOffline && status === 'syncing' && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-blue-500 px-4 py-2 text-xs font-medium text-white">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing{pendingCount > 0 ? ` (${pendingCount} pending)` : '...'}
        </div>
      )}

      {!isOffline && status === 'error' && pendingCount > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-red-500 px-4 py-2 text-xs font-medium text-white">
          <AlertCircle className="h-3 w-3" />
          Sync failed. {pendingCount} changes pending.
          <button onClick={syncNow} className="ml-2 underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {!isOffline && status === 'idle' && pendingCount > 0 && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-medium text-white shadow-lg">
          <Cloud className="h-3 w-3" />
          Synced
        </div>
      )}

      {showInstall && (
        <div className="fixed bottom-36 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Install SpendWise</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Add to home screen for quick access</p>
              <div className="mt-3 flex gap-2">
                <button onClick={handleInstall}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                  Install
                </button>
                <button onClick={() => { setShowInstall(false); setDismissedInstall(true) }}
                  className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
