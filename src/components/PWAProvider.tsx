'use client'

import { useEffect, useState, useCallback } from 'react'
import { WifiOff, Download, RefreshCw, Cloud } from 'lucide-react'
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

/** Returns true when running inside installed PWA (standalone/fullscreen) */
function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // iOS Safari standalone
    (window.navigator as { standalone?: boolean }).standalone === true
  )
}

const INSTALL_SHOWN_KEY = 'spendwise-install-shown'
const JUST_LOGGED_IN_KEY = 'spendwise-just-logged-in'

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const { status, pendingCount } = useSync()

  const tryShowPopup = useCallback((prompt: BeforeInstallPromptEvent) => {
    // Never show inside PWA
    if (isPWA()) return
    // Already shown before — skip
    if (localStorage.getItem(INSTALL_SHOWN_KEY)) return
    // Only show if user just logged in
    if (!localStorage.getItem(JUST_LOGGED_IN_KEY)) return

    // Clear the just-logged-in flag so it only shows once
    localStorage.removeItem(JUST_LOGGED_IN_KEY)
    localStorage.setItem(INSTALL_SHOWN_KEY, '1')
    setDeferredPrompt(prompt)
    setShowInstall(true)
  }, [])

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
      const prompt = e as BeforeInstallPromptEvent
      // Store globally for Settings page
      window.__swInstallPrompt = prompt
      window.dispatchEvent(new Event('spendwise-install-available'))
      // Try to show popup if conditions are met
      tryShowPopup(prompt)
    }
    window.addEventListener('beforeinstallprompt', handleInstall)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('beforeinstallprompt', handleInstall)
    }
  }, [tryShowPopup])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      window.__swInstallPrompt = undefined
      window.dispatchEvent(new Event('spendwise-install-available'))
    }
    setShowInstall(false)
    setDeferredPrompt(null)
  }

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

      {/* Install popup — only shown once, only in browser (not PWA) */}
      {showInstall && (
        <div className="fixed bottom-28 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 rounded-2xl border border-border bg-card p-4 shadow-2xl duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Install SpendWise</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Add to home screen for quick access — works offline too.</p>
              <div className="mt-3 flex gap-2">
                <button
                  id="pwa-install-btn"
                  onClick={handleInstall}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
                >
                  Install
                </button>
                <button
                  onClick={() => setShowInstall(false)}
                  className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
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
