'use client'

import Image from 'next/image'
import dollarGif from '@/assets/dollar.gif'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Image src={dollarGif} alt="Loading..." className="h-24 w-24 object-contain" unoptimized priority />
    </div>
  )
}


