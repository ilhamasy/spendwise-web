'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import dollarGif from '@/assets/dollar.gif'

interface LoadingContextType {
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)

  const showLoading = useCallback(() => setLoading(true), [])
  const hideLoading = useCallback(() => setLoading(false), [])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <img src={dollarGif.src} alt="Loading..." className="h-20 w-20" />
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
