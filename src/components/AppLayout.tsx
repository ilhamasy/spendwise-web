'use client'

import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme'
import PWAProvider from './PWAProvider'
import AppShell from './AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PWAProvider>
          <AppShell>{children}</AppShell>
        </PWAProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
