'use client'

import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme'
import AppShell from './AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppShell>{children}</AppShell>
      </ThemeProvider>
    </AuthProvider>
  )
}
