'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ReceiptText,
  Target,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ReceiptText },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/60 px-2 py-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/60 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center px-4 py-1.5"
            >
              <div className="relative z-10">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? '#6e44ff' : '#7e8494',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                >
                  <item.icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
              </div>
              <span
                className={`mt-0.5 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'text-[#6e44ff] dark:text-[#8b6aff]'
                    : 'text-[#7e8494] dark:text-[#8b88a0]'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="liquid-indicator"
                  className="absolute inset-0 rounded-full bg-[#6e44ff]/10 dark:bg-[#8b6aff]/15"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
