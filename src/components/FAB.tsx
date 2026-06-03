'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AddTransactionModal from './AddTransactionModal'
import plusIcon from '@/assets/icons8-plus-94.png'

const FAB_ROUTES = ['/dashboard', '/transactions']

export default function FAB() {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)

  if (!FAB_ROUTES.includes(pathname)) return null

  return (
    <>
      <button
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-gray-950/60 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
        aria-label="Add transaction"
        onClick={() => setModalOpen(true)}
      >
        <img src={plusIcon.src} alt="Add" className="h-7 w-7" />
      </button>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => window.dispatchEvent(new Event('transaction-updated'))}
      />
    </>
  )
}
