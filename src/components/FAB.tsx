'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AddTransactionModal from './AddTransactionModal'
import receiptIcon from '@/assets/icons8-receipt-94.png'

const FAB_ROUTES = ['/dashboard', '/transactions']

export default function FAB() {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)

  if (!FAB_ROUTES.includes(pathname)) return null

  return (
    <>
      <button
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
        aria-label="Add transaction"
        onClick={() => setModalOpen(true)}
      >
        <img src={receiptIcon.src} alt="Add" className="h-7 w-7" />
      </button>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => window.dispatchEvent(new Event('transaction-updated'))}
      />
    </>
  )
}
