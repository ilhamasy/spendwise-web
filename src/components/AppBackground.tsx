'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/theme'

const AUTH_ROUTES = ['/auth/login', '/auth/register']

export default function AppBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolved } = useTheme()

  if (AUTH_ROUTES.includes(pathname)) return <>{children}</>

  return (
    <div className={`relative min-h-dvh w-full ${resolved === 'dark' ? 'bg-black' : 'bg-[#f9fafb]'}`}>
      {resolved === 'dark' ? (
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      ) : (
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
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
