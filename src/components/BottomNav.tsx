'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, List, Target, HandCoins, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: PieChart },
  { label: 'Transactions', href: '/transactions', icon: List },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Budget', href: '/budget', icon: HandCoins },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  const activeIndex = NAV_ITEMS.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  return (
    <>
      {/* Bottom nav container — centered pill, full device width aware */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
      >
        {/* Glassmorphism pill */}
        <div
          className="relative mx-4 flex w-full max-w-sm items-center rounded-[28px] px-2 py-2 dark:hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.60)',
            boxShadow:
              '0 8px 32px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
                aria-current={isActive ? 'page' : undefined}
              >
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      layoutId="nav-bubble-light"
                      className="absolute inset-x-1 -inset-y-0.5 rounded-[20px]"
                      style={{
                        background:
                          'linear-gradient(145deg, rgba(110,68,255,0.16) 0%, rgba(110,68,255,0.08) 100%)',
                        boxShadow:
                          '0 4px 16px rgba(110,68,255,0.22), inset 0 1px 0 rgba(255,255,255,0.50)',
                        border: '1px solid rgba(110,68,255,0.15)',
                      }}
                      initial={{ scale: 0.65, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: 6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 26,
                        mass: 0.75,
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={isActive ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26, mass: 0.7 }}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={isActive ? 2.4 : 1.8}
                    style={{
                      color: isActive ? '#6e44ff' : 'var(--muted-foreground)',
                      filter: isActive
                        ? 'drop-shadow(0 1px 6px rgba(110,68,255,0.5))'
                        : 'none',
                      transition: 'color 0.2s, filter 0.2s',
                    }}
                  />
                </motion.div>
                <motion.span
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 1 }}
                  transition={{ duration: 0.18 }}
                  className="text-[9px] font-bold leading-none tracking-[0.03em]"
                  style={{ color: isActive ? '#6e44ff' : 'var(--muted-foreground)' }}
                >
                  {item.label}
                </motion.span>
              </Link>
            )
          })}
        </div>

        {/* Dark mode pill — same layout, dark glass */}
        <div
          className="relative mx-4 hidden w-full max-w-sm items-center rounded-[28px] px-2 py-2 dark:flex"
          style={{
            background: 'rgba(20, 16, 42, 0.80)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow:
              '0 12px 40px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-1"
                aria-current={isActive ? 'page' : undefined}
              >
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      layoutId="nav-bubble-dark"
                      className="absolute inset-x-1 -inset-y-0.5 rounded-[20px]"
                      style={{
                        background:
                          'linear-gradient(145deg, rgba(139,106,255,0.28) 0%, rgba(139,106,255,0.14) 100%)',
                        boxShadow:
                          '0 4px 16px rgba(139,106,255,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                        border: '1px solid rgba(139,106,255,0.22)',
                      }}
                      initial={{ scale: 0.65, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: 6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 26,
                        mass: 0.75,
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={isActive ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26, mass: 0.7 }}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={isActive ? 2.4 : 1.8}
                    style={{
                      color: isActive ? '#8b6aff' : 'var(--muted-foreground)',
                      filter: isActive
                        ? 'drop-shadow(0 1px 8px rgba(139,106,255,0.6))'
                        : 'none',
                      transition: 'color 0.2s, filter 0.2s',
                    }}
                  />
                </motion.div>
                <motion.span
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.45, y: 1 }}
                  transition={{ duration: 0.18 }}
                  className="text-[9px] font-bold leading-none tracking-[0.03em]"
                  style={{ color: isActive ? '#8b6aff' : 'var(--muted-foreground)' }}
                >
                  {item.label}
                </motion.span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer so content doesn&apos;t hide behind nav */}
      <div
        style={{
          height: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 12px))',
        }}
        aria-hidden="true"
      />
    </>
  )
}
