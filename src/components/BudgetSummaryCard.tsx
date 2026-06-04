'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getAllBudgets, getBudgetWithSpent } from '@/lib/budget-service'
import { getAllCategories } from '@/lib/category-service'
import { formatCurrency } from '@/lib/currency'
import type { Category } from '@/types'

export function BudgetSummaryCard() {
  const [items, setItems] = useState<{ name: string; emoji: string; spent: number; budget: number; progress: number }[]>([])
  const [loaded, setLoaded] = useState(false)

  const loadData = useCallback(async () => {
    const [budgets, cats] = await Promise.all([getAllBudgets(), getAllCategories('expense')])
    const catMap = new Map<string, Category>(cats.map((c) => [c.id, c]))
    const stats = await Promise.all(budgets.map((b) => getBudgetWithSpent(b)))
    const top = stats
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3)
      .map(({ budget, spent, progress }) => ({
        name: budget.name || catMap.get(budget.categoryId)?.name || 'Budget',
        emoji: catMap.get(budget.categoryId)?.icon || '📁',
        spent,
        budget: budget.amount,
        progress,
      }))
    setItems(top)
    setLoaded(true)
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-5 space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-10 animate-pulse rounded bg-muted" />))}</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Budget</h3>
        {items.length > 0 && (
          <Link href="/budget" className="text-xs font-medium text-primary hover:underline">See all</Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground">
          <p>No budgets yet</p>
          <Link href="/budget" className="mt-1 text-primary hover:underline">Create a budget</Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((item) => {
            const isOver = item.progress >= 100
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>{item.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${isOver ? 'text-red-500' : 'text-foreground'}`}>
                    {item.progress}%
                  </span>
                </div>
                <div className={`mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-950/30`}>
                  <div className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(item.progress, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
