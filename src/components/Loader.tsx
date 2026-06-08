'use client'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex h-[5.4em] w-[5.4em] items-center justify-center">
        <div className="absolute h-[7.1em] w-[7.1em] left-[1.7em] top-[1.7em] border-l-[0.25em] border-l-white rotate-[45deg] after:content-[''] after:absolute after:w-[7.1em] after:h-[7.1em] after:left-0 after:bg-transparent" />
        <div className="absolute bottom-[-0.1em] left-0 h-[1em] w-[1em] rounded-[15%] border-[0.25em] border-white translate-y-[-1em] -rotate-[45deg] animate-loader-push" />
      </div>
    </div>
  )
}
