'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your profile and preferences.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Profile</h2>
          <div className="mt-2 space-y-1">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Appearance</h2>
          <p className="mt-1 text-foreground">Theme settings coming soon.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Security</h2>
          <button
            onClick={handleLogout}
            className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
