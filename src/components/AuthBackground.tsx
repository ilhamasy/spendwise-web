'use client'

import { useTheme } from '@/lib/theme'

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme()

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {resolved === 'dark' ? (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 50%, #2a5d77 0%, #184058 18%, #0f2a43 34%, #0a1b30 50%, #071226 66%, #040d1c 80%, #020814 92%, #01040d 97%, #000309 100%), radial-gradient(160% 130% at 10% 10%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%), radial-gradient(160% 130% at 90% 90%, rgba(0,0,0,0) 38%, #000309 76%, #000208 100%)',
          }}
        />
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #41B883 100%)',
            backgroundSize: '100% 100%',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
