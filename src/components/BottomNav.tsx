'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import dashboardIcon from '@/assets/icons8-dashboard-94.png'
import billIcon from '@/assets/icons8-bill-94.png'
import goalIcon from '@/assets/icons8-goal-94.png'
import settingIcon from '@/assets/icons8-setting-94.png'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: dashboardIcon },
  { label: 'Transactions', href: '/transactions', icon: billIcon },
  { label: 'Goals', href: '/goals', icon: goalIcon },
  { label: 'Settings', href: '/settings', icon: settingIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  const activeIndex = NAV_ITEMS.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  )

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="relative flex items-center gap-0.5 rounded-full border border-white/20 bg-white/60 px-1.5 py-1.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/60 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              >
                <img src={item.icon.src} alt={item.label} className="h-5 w-5" />
              </motion.div>
              <span className="text-[10px] font-semibold">
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="pill"
                  className="absolute inset-0 -z-10 rounded-full bg-[#6e44ff]/10 dark:bg-[#8b6aff]/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
