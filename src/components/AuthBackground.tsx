'use client'

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full dark:bg-black" suppressHydrationWarning>
      {/* Light: purple gradient */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)',
        }}
      />
      {/* Dark: violet storm */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%), #000000',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
