'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { Sun, Moon, Monitor, Download, Trash2 } from 'lucide-react'
import CategoryList from '@/components/CategoryList'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { theme, resolved, setTheme } = useTheme()
  const router = useRouter()

  const [displayName, setDisplayName] = useState(user?.name || '')
  const [nameSaved, setNameSaved] = useState(false)

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Clear data
  const [clearConfirm, setClearConfirm] = useState(false)

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function handleSaveName() {
    if (displayName.trim() && user) {
      const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
      const idx = users.findIndex((u: { id: string }) => u.id === user.id)
      if (idx !== -1) {
        users[idx].name = displayName.trim()
        localStorage.setItem('spendwise-users', JSON.stringify(users))
      }
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    }
  }

  async function handleChangePassword() {
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword || !newPassword) {
      setPasswordError('All fields are required')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
    const found = users.find((u: { id: string }) => u.id === user?.id)
    if (!found) {
      setPasswordError('User not found')
      return
    }

    const bcrypt = await import('bcryptjs')
    const valid = await bcrypt.compare(currentPassword, found.passwordHash)
    if (!valid) {
      setPasswordError('Current password is incorrect')
      return
    }

    found.passwordHash = await bcrypt.hash(newPassword, 12)
    localStorage.setItem('spendwise-users', JSON.stringify(users))
    setCurrentPassword('')
    setNewPassword('')
    setPasswordSuccess('Password changed successfully')
    setTimeout(() => setPasswordSuccess(''), 3000)
  }

  async function handleClearData() {
    await db.transactions.clear()
    await db.savingGoals.clear()
    await db.goalContributions.clear()
    await db.categories.clear()
    setClearConfirm(false)
  }

  async function handleDeleteAccount() {
    if (!user) return
    await db.transactions.clear()
    await db.savingGoals.clear()
    await db.goalContributions.clear()
    await db.categories.clear()
    const users = JSON.parse(localStorage.getItem('spendwise-users') || '[]')
    localStorage.setItem('spendwise-users', JSON.stringify(users.filter((u: { id: string }) => u.id !== user.id)))
    logout()
    router.push('/auth/login')
  }

  function handleExport() {
    Promise.all([
      db.transactions.toArray(),
      db.categories.toArray(),
      db.savingGoals.toArray(),
      db.goalContributions.toArray(),
    ]).then(([txs, cats, goals, contributions]) => {
      const data = { transactions: txs, categories: cats, savingGoals: goals, goalContributions: contributions }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'spendwise-export.json'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="mt-8 space-y-4">
        {/* Profile */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground">Profile</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground">Name</label>
              <div className="mt-1 flex gap-2">
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={handleSaveName}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90">
                  {nameSaved ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground">Email</label>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground">Change Password</h2>
          <div className="mt-3 space-y-3">
            {passwordError && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{passwordError}</p>}
            {passwordSuccess && <p className="rounded-lg bg-green-50 p-2 text-xs text-green-600 dark:bg-green-950 dark:text-green-400">{passwordSuccess}</p>}
            <div>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 8 characters)"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={handleChangePassword}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90">
              Change Password
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground">Appearance</h2>
          <div className="mt-3 flex gap-2">
            {([
              { key: 'light' as const, icon: Sun, label: 'Light' },
              { key: 'dark' as const, icon: Moon, label: 'Dark' },
              { key: 'system' as const, icon: Monitor, label: 'System' },
            ]).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setTheme(key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all ${
                  theme === key ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <CategoryList />
        </div>

        {/* Data Management */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground">Data</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Export JSON
            </button>
            <button onClick={() => setClearConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              <Trash2 className="h-3.5 w-3.5" /> Clear All Data
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground">Account</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => { logout(); router.push('/auth/login') }}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
              Logout
            </button>
            <button onClick={() => setDeleteConfirm(true)}
              className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog open={clearConfirm} title="Clear All Data" message="This will delete all transactions, goals, and categories. This action cannot be undone."
        confirmLabel="Clear All" variant="danger" onConfirm={handleClearData} onCancel={() => setClearConfirm(false)} />

      <ConfirmDialog open={deleteConfirm} title="Delete Account"
        message="Your account and all data will be permanently deleted. This cannot be undone."
        confirmLabel="Delete Account" variant="danger" onConfirm={handleDeleteAccount} onCancel={() => setDeleteConfirm(false)} />
    </div>
  )
}
