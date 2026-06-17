'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoogleCallback() {
  const searchParams = useSearchParams()
  const redirected = useRef(false)

  useEffect(() => {
    if (redirected.current) return
    redirected.current = true

    const code = searchParams.get('code')
    if (!code) {
      window.location.href = '/login?error=missing-code'
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    window.location.href = `${apiUrl}/api/v1/auth/google/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}`
  }, [searchParams])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
    </div>
  )
}
