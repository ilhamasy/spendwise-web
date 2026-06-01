'use client'

import { usePathname } from 'next/navigation'
import AuthGuard from './AuthGuard'
import BottomNav from './BottomNav'
import FAB from './FAB'

const AUTH_ROUTES = ['/auth/login', '/auth/register']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_ROUTES.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24">
          {children}
        </main>
        <BottomNav />
        <FAB />
      </div>
    </AuthGuard>
  )
}
