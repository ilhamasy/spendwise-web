'use client'

import Image from 'next/image'
import dollarGif from '@/assets/dollar.gif'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Image src={dollarGif} alt="Loading..." className="h-20 w-20" unoptimized />
    </div>
  )
}
