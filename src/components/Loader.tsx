'use client'

import dollarGif from '@/assets/dollar.gif'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <img src={dollarGif.src} alt="Loading..." className="h-20 w-20" />
    </div>
  )
}
