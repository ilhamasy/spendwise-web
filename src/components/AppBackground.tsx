'use client'

import { usePathname } from 'next/navigation'

const AUTH_ROUTES = ['/auth/login', '/auth/register']

export default function AppBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (AUTH_ROUTES.includes(pathname)) return <>{children}</>

  return (
    <div className="relative min-h-dvh w-full bg-[#f9fafb]">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #d1d5db 1px, transparent 1px),
            linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
