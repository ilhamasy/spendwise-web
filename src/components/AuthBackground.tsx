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
      {/* Dark: midnight mist */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
