'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getAllGoals } from '@/lib/goal-service'
import { formatCurrency } from '@/lib/currency'
import type { SavingGoal } from '@/types'

export default function SavingGoalsCard() {
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [loaded, setLoaded] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = useCallback(async () => {
    setGoals((await getAllGoals('active')).slice(0, 3))
    setLoaded(true)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData, refreshKey])

  useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [])

  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-5 space-y-5">{[1, 2, 3].map((i) => (<div key={i} className="space-y-2"><div className="h-4 w-3/4 animate-pulse rounded bg-muted" /><div className="h-2 w-full animate-pulse rounded bg-muted" /></div>))}</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Saving Goals</h3>
        {goals.length > 0 && (
          <Link href="/goals" className="text-xs font-medium text-primary hover:underline">See all</Link>
        )}
      </div>
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
          <p>No saving goals yet</p>
          <Link href="/goals" className="mt-1 text-primary hover:underline">Create your first goal</Link>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100)
            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{goal.name}</p>
                  <span className="text-xs font-semibold text-foreground">{progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-950/30">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(goal.currentSaved)} of {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
