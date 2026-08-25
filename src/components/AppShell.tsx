'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import AuthGuard from './AuthGuard'
import BottomNav from './BottomNav'
import FAB from './FAB'
import DataLoader from './DataLoader'
import ConnectivityStatus from './ConnectivityStatus'
import { AppDataProvider } from '@/lib/app-data-context'

const AUTH_ROUTES = ['/']

// iOS-style: page slides in from right, exits to left
// mode="popLayout" lets both exit & enter run simultaneously (no blank gap)
const pageVariants = {
  initial: { opacity: 0, x: 20, scale: 0.985 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.985 },
}

const pageTransition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 34,
  mass: 0.8,
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_ROUTES.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <DataLoader>
        <AppDataProvider>
          <div className="flex min-h-dvh flex-col">
            <ConnectivityStatus />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                  className="p-4 sm:p-6 lg:p-8 pb-4 safe-top min-h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
            <footer className="border-t border-border py-4 text-center">
              <p className="text-xs text-muted-foreground">© 2026 Ilham Asyari. All rights reserved.</p>
            </footer>
            <BottomNav />
            <FAB />
          </div>
        </AppDataProvider>
      </DataLoader>
    </AuthGuard>
  )
}
