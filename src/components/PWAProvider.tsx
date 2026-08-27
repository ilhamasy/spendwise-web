'use client'

import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw, Cloud } from 'lucide-react'
import { syncManager } from '@/lib/sync-manager'
import { useSync } from '@/lib/use-sync'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Expose install prompt globally so Settings page can trigger it
declare global {
  interface Window {
    __swInstallPrompt?: BeforeInstallPromptEvent
  }
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { status, pendingCount } = useSync()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setIsOffline(!navigator.onLine)

    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    const goOffline = () => setIsOffline(true)
    const goOnline = () => {
      setIsOffline(false)
      syncManager.processQueue().then(() => syncManager.pullChanges())
    }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    const handleInstall = (e: Event) => {
      e.preventDefault()
      // Store on window so Settings page can access it at any time
      window.__swInstallPrompt = e as BeforeInstallPromptEvent
      // Dispatch event so Settings page can re-render if open
      window.dispatchEvent(new Event('spendwise-install-available'))
    }
    window.addEventListener('beforeinstallprompt', handleInstall)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('beforeinstallprompt', handleInstall)
    }
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <>
      {children}

      {isOffline && mounted && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-medium text-white">
          <WifiOff className="h-3 w-3" />
          You are offline. Changes will sync when reconnected.
        </div>
      )}

      {!isOffline && status === 'syncing' && pendingCount > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-xs font-medium text-white shadow-md">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Syncing {pendingCount} {pendingCount === 1 ? 'item' : 'items'}...
        </div>
      )}

      {!isOffline && status === 'idle' && pendingCount > 0 && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-medium text-white shadow-lg">
          <Cloud className="h-3 w-3" />
          {pendingCount} Pending Sync
        </div>
      )}
    </>
  )
}
