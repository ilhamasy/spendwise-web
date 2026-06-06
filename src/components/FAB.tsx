'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import AddTransactionModal from './AddTransactionModal'
import { useToast } from './ToastProvider'

const FAB_ROUTES = ['/dashboard', '/transactions']

export default function FAB() {
  const pathname = usePathname()
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()

  if (!FAB_ROUTES.includes(pathname)) return null

  return (
    <>
      <button
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 dark:bg-gray-900/70 dark:border-white/10 dark:shadow-black/20 transition-all hover:scale-105 active:scale-95"
        aria-label="Add transaction"
        onClick={() => setModalOpen(true)}
      >
        <Plus size={26} strokeWidth={1.5} className="text-indigo-600 dark:text-indigo-400" />
      </button>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event('transaction-updated'))
          showToast('Transaction saved successfully', 'success')
        }}
      />
    </>
  )
}
