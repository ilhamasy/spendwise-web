'use client'

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
