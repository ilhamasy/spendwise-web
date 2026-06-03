'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Transaction, Category } from '@/types'
import { db } from '@/lib/db'
import { getAllCategories } from '@/lib/category-service'
import { deleteTransaction } from '@/lib/transaction-service'
import { formatCurrency } from '@/lib/currency'
import ConfirmDialog from '@/components/ConfirmDialog'
import DateFilter, { getFilterDateRange } from '@/components/DateFilter'
import type { FilterPeriod } from '@/components/DateFilter'

const ITEMS_PER_PAGE = 10

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  const [filterType, setFilterType] = useState<FilterPeriod>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [minDate, setMinDate] = useState('2024-01-01')

  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  useEffect(() => {
    db.transactions.orderBy('occurredAt').first().then((first) => {
      if (first) setMinDate(first.occurredAt)
    })
  }, [])

  const loadData = useCallback(async () => {
    const [allTx, cats] = await Promise.all([
      db.transactions.orderBy('occurredAt').reverse().toArray(),
      getAllCategories(),
    ])
    setCategories(cats)
    setLoaded(true)

    let filtered = allTx

    if (filterType !== 'custom') {
      const { start, end } = getFilterDateRange(filterType, customStart, customEnd)
      filtered = allTx.filter((t) => t.occurredAt >= start && t.occurredAt <= end)
    } else if (customStart && customEnd) {
      filtered = allTx.filter((t) => t.occurredAt >= customStart && t.occurredAt <= customEnd)
    }

    if (sortBy === 'amount') {
      filtered.sort((a, b) => sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount)
    } else {
      filtered.sort((a, b) => {
        const cmp = a.occurredAt.localeCompare(b.occurredAt) || a.createdAt.localeCompare(b.createdAt)
        return sortDir === 'desc' ? -cmp : cmp
      })
    }

    setTransactions(filtered)
    setPage(1)
  }, [filterType, customStart, customEnd, sortBy, sortDir])

   
  useEffect(() => {
    loadData()
  }, [loadData])

   
  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  const paginated = transactions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const getCat = (id: string) => categories.find((c) => c.id === id)

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteTransaction(deleteTarget.id)
    setDeleteTarget(null)
    window.dispatchEvent(new Event('transaction-updated'))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          View and manage all your transactions.
        </p>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <DateFilter
          period={filterType}
          customStart={customStart}
          customEnd={customEnd}
          minDate={minDate}
          onPeriodChange={setFilterType}
          onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e) }}
        />

        <div className="ml-auto flex items-center gap-2">
          <select value={`${sortBy}-${sortDir}`} onChange={(e) => {
            const [s, d] = e.target.value.split('-') as ['date' | 'amount', 'desc' | 'asc']
            setSortBy(s); setSortDir(d)
          }} className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground">
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </div>
      </div>

      {/* List */}
      {!loaded ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}</div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">No transactions found</p>
          {filterType !== 'year' && (
            <button onClick={() => setFilterType('year')} className="mt-2 text-xs text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {paginated.map((tx) => {
              const cat = getCat(tx.categoryId)
              const isIncome = tx.type === 'income'
              return (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-base">
                    {cat?.icon || '📁'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{cat?.name || 'Unknown'}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${isIncome ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                        {isIncome ? 'Income' : 'Expense'}
                      </span>
                    </div>
                    {tx.note && <p className="truncate text-xs text-muted-foreground">{tx.note}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(tx.occurredAt).toLocaleDateString('en-GB')}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      onClick={() => setDeleteTarget(tx)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {transactions.length} transactions · Sorted by {sortBy === 'date' ? 'Date' : 'Amount'} ({sortDir === 'desc' ? 'newest' : 'oldest'})
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-foreground">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Transaction"
        message={`Delete this ${deleteTarget?.type} transaction of ${deleteTarget ? formatCurrency(deleteTarget.amount) : ''}?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
