'use client'

import { usePathname } from 'next/navigation'

const AUTH_ROUTES = ['/']

export default function AppBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (AUTH_ROUTES.includes(pathname)) return <>{children}</>

  return (
    <div className="relative min-h-dvh w-full bg-white dark:bg-black" suppressHydrationWarning>
      {/* Light purple-gradient grid */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            radial-gradient(circle 800px at 100% 200px, #d5c5ff, transparent)
          `,
          backgroundSize: '96px 64px, 96px 64px, 100% 100%',
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
