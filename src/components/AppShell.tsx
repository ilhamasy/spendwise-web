'use client'

import { usePathname } from 'next/navigation'
import AuthGuard from './AuthGuard'
import Sidebar from './Sidebar'
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
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            {children}
          </main>
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
        <FAB />
      </div>
    </AuthGuard>
  )
}
