'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.includes('spendwise-token=')
    router.replace(token ? '/dashboard' : '/')
  }, [router])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
    </div>
  )
}
