'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { WifiOff } from 'lucide-react'

export default function ConnectivityStatus() {
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true))
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wasOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      wasOnlineRef.current = true
      setShowOfflineModal(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }

    const handleOffline = () => {
      setIsOnline(false)
      if (wasOnlineRef.current) {
        setShowOfflineModal(true)
        setCountdown(30)

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current)
              setShowOfflineModal(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
      wasOnlineRef.current = false
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function closeOfflineModal() {
    setShowOfflineModal(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const isDashboard = pathname === '/dashboard'

  return (
    <>
      {/* Top-Right Floating Status Badge — Dashboard only */}
      {isDashboard && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 shadow-sm backdrop-blur-md transition-all">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span
            className={`text-xs font-semibold tracking-wide ${
              isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      )}
      {/* Offline Warning Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <WifiOff className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Koneksi Terputus</h3>
                <p className="text-xs text-muted-foreground">Status: Offline ({countdown}s)</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-foreground/90">
              Kamu sedang Offline, tapi tetap tenang. Kamu masih bisa melanjutkan aktivitas pencatatan
              transaksi dan lain lain, data kamu akan disimpan di Local Storage, Once kamu sudah Online
              kembali, data tersebut akan dilakukan sync kembali ;)
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">Otomatis menutup dalam {countdown}s</span>
              <button
                onClick={closeOfflineModal}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
