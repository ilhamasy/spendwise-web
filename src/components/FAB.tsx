'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AddTransactionModal from './AddTransactionModal'

const FAB_ROUTES = ['/dashboard', '/transactions']

export default function FAB() {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)

  if (!FAB_ROUTES.includes(pathname)) return null

  return (
    <>
      <button
        className="fixed bottom-28 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
        aria-label="Add transaction"
        onClick={() => setModalOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
