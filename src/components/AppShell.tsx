'use client'

import { usePathname } from 'next/navigation'
import AuthGuard from './AuthGuard'
import BottomNav from './BottomNav'
import FAB from './FAB'
import DataLoader from './DataLoader'

const AUTH_ROUTES = ['/', '/login', '/register']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_ROUTES.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <DataLoader>
        <div className="flex min-h-dvh flex-col">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 safe-top">
            {children}
          </main>
          <footer className="border-t border-border py-4 text-center">
            <p className="text-xs text-muted-foreground">© 2026 Ilham Asyari. All rights reserved.</p>
          </footer>
          <BottomNav />
          <FAB />
        </div>
      </DataLoader>
    </AuthGuard>
  )
}
