'use client'

import { ThemeProvider } from '@/lib/theme'
import BottomNav from '@/components/BottomNav'
import FAB from '@/components/FAB'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-dvh flex-col">
        <main className="flex-1 pb-24">
          {children}
        </main>
        <BottomNav />
        <FAB />
      </div>
    </ThemeProvider>
  )
}
