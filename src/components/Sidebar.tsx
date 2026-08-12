'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ReceiptText,
  Target,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  PiggyBank,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import { syncManager } from '@/lib/sync-manager'
import ConfirmDialog from '@/components/ConfirmDialog'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ReceiptText },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { resolved, setTheme } = useTheme()
  const [unsavedLogoutOpen, setUnsavedLogoutOpen] = useState(false)

  async function handleLogout() {
    const pending = await syncManager.getPendingCount()
    if (pending > 0) {
      setUnsavedLogoutOpen(true)
    } else {
      await logout(true)
      window.location.href = '/'
    }
  }

  async function handleConfirmLogout() {
    setUnsavedLogoutOpen(false)
    await logout(true)
    window.location.href = '/'
  }

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">SpendWise</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-primary-light hover:text-foreground',
                )}
              >
                <item.icon className="h-4.5 w-4.5" strokeWidth={2} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="space-y-3 border-t border-border px-3 py-4">
          <button className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary-light hover:text-foreground transition-all">
            <HelpCircle className="h-4.5 w-4.5" />
            Help
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary-light hover:text-foreground transition-all"
          >
            {resolved === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            {resolved === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>

          {user && (
            <div className="flex items-center gap-3 px-4 pt-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={unsavedLogoutOpen}
        title="Unsaved Data Warning"
        message="There's a data transaction not saving online, Is you still logout?"
        confirmLabel="Yes"
        cancelLabel="No"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setUnsavedLogoutOpen(false)}
      />
    </>
  )
}
