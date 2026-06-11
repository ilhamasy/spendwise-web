'use client'

import { usePathname } from 'next/navigation'

const AUTH_ROUTES = ['/']

export default function AppBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (AUTH_ROUTES.includes(pathname)) return <>{children}</>

  return (
    <div className="relative min-h-dvh w-full bg-white dark:bg-black" suppressHydrationWarning>
      {/* Light dual-gradient overlay */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: '48px 48px, 48px 48px, 100% 100%, 100% 100%',
        }}
      />
      {/* Dark grid */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: '#000000',
          backgroundImage: `
            linear-gradient(to right, rgba(75, 85, 99, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
