'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

interface LoadingContextType {
  showLoading: () => void
  hideLoading: () => void
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
  isLoading: false,
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [requestCount, setRequestCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const countRef = useRef(0)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const increment = useCallback(() => {
    countRef.current += 1
    setRequestCount(countRef.current)
  }, [])

  const decrement = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    setRequestCount(countRef.current)
  }, [])

  const showLoading = useCallback(() => { increment() }, [increment])
  const hideLoading = useCallback(() => { decrement() }, [decrement])

  const isLoading = requestCount > 0

  // Animate progress bar when loading starts/ends
  useEffect(() => {
    if (isLoading) {
      // Clear any pending hide
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      // Animate from 0 to ~80% smoothly — deferred to avoid setState-in-effect lint error
      const startTimer = setTimeout(() => {
        setProgress(10)
      }, 0)
      let p = 10
      progressTimerRef.current = setInterval(() => {
        p = Math.min(p + (90 - p) * 0.12, 88)
        setProgress(p)
      }, 120)
      return () => {
        clearTimeout(startTimer)
        if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      }
    } else {
      // Snap to 100% then hide
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        setProgress(100)
        hideTimerRef.current = setTimeout(() => {
          setProgress(0)
        }, 320)
      }, 0)
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    }
  }, [isLoading])

  // Listen to global window events (legacy — kept for compatibility)
  useEffect(() => {
    const handleStart = () => increment()
    const handleEnd = () => decrement()
    window.addEventListener('spendwise-loading-start', handleStart)
    window.addEventListener('spendwise-loading-end', handleEnd)
    return () => {
      window.removeEventListener('spendwise-loading-start', handleStart)
      window.removeEventListener('spendwise-loading-end', handleEnd)
    }
  }, [increment, decrement])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {/* Slim top progress bar — only visible when isLoading or animating out */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[2.5px] w-full"
        style={{ opacity: progress > 0 ? 1 : 0, transition: 'opacity 0.2s' }}
      >
        <div
          className="h-full rounded-r-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6e44ff 0%, #a78bfa 60%, #c4b5fd 100%)',
            boxShadow: '0 0 10px rgba(110,68,255,0.7), 0 0 4px rgba(110,68,255,0.4)',
            transition: progress === 100 ? 'width 0.18s ease-out' : 'width 0.12s linear',
          }}
        />
      </div>
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
