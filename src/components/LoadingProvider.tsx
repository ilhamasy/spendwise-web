'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import dollarGif from '@/assets/dollar.gif'

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
  const countRef = useRef(0)

  const increment = useCallback(() => {
    countRef.current += 1
    setRequestCount(countRef.current)
  }, [])

  const decrement = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    setRequestCount(countRef.current)
  }, [])

  const showLoading = useCallback(() => {
    increment()
  }, [increment])

  const hideLoading = useCallback(() => {
    decrement()
  }, [decrement])

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

  const isLoading = requestCount > 0

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <Image src={dollarGif} alt="Loading..." className="h-24 w-24 object-contain" unoptimized priority />
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}


