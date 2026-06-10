'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { useLoading } from '@/components/LoadingProvider'
import { X, Sun, Moon } from 'lucide-react'

type Mode = 'login' | 'register'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const router = useRouter()
  const { login, register } = useAuth()
  const { resolved, setTheme } = useTheme()
  const { showLoading, hideLoading } = useLoading()
  const [mode, setMode] = useState<Mode>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open) return null

  function reset() {
    setEmail('')
    setPassword('')
    setName('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
    setShowConfirm(false)
  }

  function switchMode(newMode: Mode) {
    reset()
    setMode(newMode)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!navigator.onLine) { setError('You must be online to sign in'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (!password) { setError('Password is required'); return }

    setIsSubmitting(true)
    showLoading()
    try {
      await login(email.trim(), password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
      hideLoading()
    }
  }

  function validateRegister(): string | null {
    if (!name.trim()) return 'Name is required'
    if (!email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!navigator.onLine) { setError('You must be online to register'); return }
    const validationError = validateRegister()
    if (validationError) { setError(validationError); return }

    setIsSubmitting(true)
    showLoading()
    try {
      await register(name.trim(), email.trim(), password)
      reset()
      setMode('login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
      hideLoading()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card shadow-2xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-foreground">Email</label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[#0A3622] focus:outline-none focus:ring-1 focus:ring-[#0A3622]/30"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label htmlFor="modal-password" className="block text-sm font-medium text-foreground">Password</label>
                <div className="relative mt-1">
                  <input
                    id="modal-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:border-[#0A3622] focus:outline-none focus:ring-1 focus:ring-[#0A3622]/30"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.257 10.962c.474.62.474 1.457 0 2.076C19.764 14.987 16.182 19 12 19c-4.182 0-7.764-4.013-9.257-5.962a1.692 1.692 0 0 1 0-2.076C4.236 9.013 7.818 5 12 5c4.182 0 7.764 4.013 9.257 5.962Z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="modal-name" className="block text-sm font-medium text-foreground">Name</label>
                <input
                  id="modal-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[#0A3622] focus:outline-none focus:ring-1 focus:ring-[#0A3622]/30"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label htmlFor="modal-reg-email" className="block text-sm font-medium text-foreground">Email</label>
                <input
                  id="modal-reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-[#0A3622] focus:outline-none focus:ring-1 focus:ring-[#0A3622]/30"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label htmlFor="modal-reg-password" className="block text-sm font-medium text-foreground">Password</label>
                <div className="relative mt-1">
                  <input
                    id="modal-reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:border-[#0A3622] focus:outline-none focus:ring-1 focus:ring-[#0A3622]/30"
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.257 10.962c.474.62.474 1.457 0 2.076C19.764 14.987 16.182 19 12 19c-4.182 0-7.764-4.013-9.257-5.962a1.692 1.692 0 0 1 0-2.076C4.236 9.013 7.818 5 12 5c4.182 0 7.764 4.013 9.257 5.962Z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="modal-confirm" className="block text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative mt-1">
                  <input
                    id="modal-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:border-[#0A3622] focus:outline-none focus:ring-1 focus:ring-[#0A3622]/30"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.257 10.962c.474.62.474 1.457 0 2.076C19.764 14.987 16.182 19 12 19c-4.182 0-7.764-4.013-9.257-5.962a1.692 1.692 0 0 1 0-2.076C4.236 9.013 7.818 5 12 5c4.182 0 7.764 4.013 9.257 5.962Z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
