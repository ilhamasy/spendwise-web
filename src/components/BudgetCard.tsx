'use client'

import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { db } from '@/lib/db'
import { getAllCategories } from '@/lib/category-service'
import { formatCurrency } from '@/lib/currency'
import { OTHER_COLOR } from '@/lib/constants'
import { getFilterDateRange } from '@/components/DateFilter'
import type { FilterPeriod } from '@/components/DateFilter'

const TOP_N = 5

interface Props {
  year: number
  period: FilterPeriod
  customStart: string
  customEnd: string
}

const PERIOD_LABELS: Record<FilterPeriod, string> = {
  week: 'week',
  month: 'month',
  year: 'year',
  custom: 'period',
}

export default function BudgetCard({ year, period, customStart, customEnd }: Props) {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([])
  const [total, setTotal] = useState(0)

  const loadData = useCallback(async () => {
    const [allTx, categories] = await Promise.all([
      db.transactions.toArray(),
      getAllCategories('expense'),
    ])

    const { start, end } = getFilterDateRange(period, customStart, customEnd)

    const filtered = allTx.filter(
      (t) => t.type === 'expense' && t.occurredAt >= start && t.occurredAt <= end,
    )

    const colorMap = new Map(categories.map((c) => [c.id, c.color || '#6b7280']))

    const grouped = new Map<string, { total: number; name: string; color: string }>()
    filtered.forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)
      const key = tx.categoryId
      if (!grouped.has(key)) {
        grouped.set(key, { total: 0, name: cat?.name || 'Unknown', color: colorMap.get(key) || '#6b7280' })
      }
      grouped.get(key)!.total += tx.amount
    })

    const sorted = [...grouped.values()].sort((a, b) => b.total - a.total)
    const top = sorted.slice(0, TOP_N)
    const otherTotal = sorted.slice(TOP_N).reduce((s, v) => s + v.total, 0)
    if (otherTotal > 0) top.push({ name: 'Other', total: otherTotal, color: OTHER_COLOR })

    setData(top.map((v) => ({ name: v.name, value: v.total, color: v.color })))
    setTotal(top.reduce((s, v) => s + v.total, 0))
  }, [period, customStart, customEnd, year])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  if (data.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Moneytory</h3>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No expense data for this {PERIOD_LABELS[period]}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">Moneytory</h3>
      <div className="relative mt-4 flex flex-1 items-center justify-center">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={64} outerRadius={96} dataKey="value" strokeWidth={0}>
                {data.map((e, i) => (<Cell key={`cell-${i}`} fill={e.color} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total for {PERIOD_LABELS[period]}</p>
          <p className="text-base font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <span className="text-xs font-medium text-foreground">{pct}% - {formatCurrency(item.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
