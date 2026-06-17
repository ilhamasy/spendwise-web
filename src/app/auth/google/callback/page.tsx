'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GoogleCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const exchanged = useRef(false)

  useEffect(() => {
    if (exchanged.current) return
    exchanged.current = true

    const code = searchParams.get('code')
    if (!code) {
      router.push('/login?error=missing-code')
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

    fetch(`${apiUrl}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      credentials: 'include',
    })
      .then(async (res) => {
        const body = await res.text()
        if (!res.ok) {
          let message = 'Google login failed'
          try { message = JSON.parse(body).message || message } catch {}
          throw new Error(message)
        }
        return JSON.parse(body)
      })
      .then((data) => {
        localStorage.setItem('spendwise-session', data.user.id)
        localStorage.setItem('spendwise-profile', JSON.stringify(data.user))
        router.push('/dashboard')
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to server')
      })
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={() => router.push('/login')} className="mt-4 text-violet-600 text-sm font-medium hover:underline">
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
    </div>
  )
}
