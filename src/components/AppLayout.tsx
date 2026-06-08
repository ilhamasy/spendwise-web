'use client'

import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/lib/theme'
import { ToastProvider } from './ToastProvider'
import PWAProvider from './PWAProvider'
import AppBackground from './AppBackground'
import AppShell from './AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <PWAProvider>
            <AppBackground>
              <AppShell>{children}</AppShell>
            </AppBackground>
          </PWAProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
