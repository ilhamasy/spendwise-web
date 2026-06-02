'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getRecentTransactions } from '@/lib/transaction-service'
import { getAllCategories } from '@/lib/category-service'
import { formatCurrency } from '@/lib/currency'
import type { Transaction, Category } from '@/types'

function relativeDateTime(dateStr: string, createdAt: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = (today.getTime() - target.getTime()) / 86400000

  const time = new Date(createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  if (diff === 0) return `Today ${time}`
  if (diff === 1) return `Yesterday ${time}`
  return `${d.toLocaleDateString('en-GB')} ${time}`
}

export default function RecentTransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  const loadData = useCallback(async () => {
    const [txs, cats] = await Promise.all([getRecentTransactions(3), getAllCategories()])
    setTransactions(txs)
    setCategories(cats)
    setLoaded(true)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  const getCat = (id: string) => categories.find((c) => c.id === id)

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-12 animate-pulse rounded bg-muted" />))}</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
        {transactions.length > 0 && (
          <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">See all</Link>
        )}
      </div>
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
          <p>No transactions yet</p>
          <p className="mt-1">Tap + to add your first transaction.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">Datetime</th>
                <th className="pb-2 text-left font-medium">Note</th>
                <th className="pb-2 text-left font-medium">Category</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const cat = getCat(tx.categoryId)
                const isIncome = tx.type === 'income'
                return (
                  <tr key={tx.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 text-muted-foreground">{relativeDateTime(tx.occurredAt, tx.createdAt)}</td>
                    <td className="py-3 text-foreground max-w-[120px] truncate">{tx.note || '-'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        {cat?.icon && <span className="text-sm">{cat.icon}</span>}
                        <span className="text-muted-foreground">{cat?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className={`py-3 text-right font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount).replace('Rp', '')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
