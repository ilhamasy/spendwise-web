'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import Image from 'next/image'
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

  const showLoading = useCallback(() => {
    setLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setTimeout(() => setLoading(false), 300)
  }, [])

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Image src={dollarGif} alt="Loading..." className="h-20 w-20" unoptimized />
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
