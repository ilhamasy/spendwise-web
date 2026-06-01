'use client'

import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme'
import AuthGuard from '@/components/AuthGuard'
import BottomNav from '@/components/BottomNav'
import FAB from '@/components/FAB'
import { usePathname } from 'next/navigation'

const AUTH_ROUTES = ['/auth/login', '/auth/register']

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_ROUTES.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1 pb-24">
          {children}
        </main>
        <BottomNav />
        <FAB />
      </div>
    </AuthGuard>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppShell>{children}</AppShell>
      </ThemeProvider>
    </AuthProvider>
  )
}
