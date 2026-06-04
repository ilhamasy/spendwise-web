'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/currency'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  year: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-[11px]">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.name === 'income' ? '#22c55e' : '#ef4444' }}
          />
          <span className="text-muted-foreground capitalize">{entry.name}</span>
          <span className="ml-auto font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function MoneyFlowCard({ year }: Props) {
  const [data, setData] = useState<{ month: string; income: number; expense: number }[]>([])

  const loadData = useCallback(async () => {
    const all = await db.transactions.toArray()
    const yearly = all.filter((t) => t.occurredAt.startsWith(String(year)))
    setData(
      MONTHS.map((month, i) => {
        const m = String(i + 1).padStart(2, '0')
        const monthTx = yearly.filter((t) => t.occurredAt.slice(5, 7) === m)
        return {
          month,
          income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        }
      }),
    )
  }, [year])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  const isEmpty = data.every((d) => d.income === 0 && d.expense === 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Money Flow</h3>
        <span className="text-xs text-muted-foreground">{year}</span>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
          <span className="text-xs text-muted-foreground">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="text-xs text-muted-foreground">Expense</span>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No data for {year}
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e9ed" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e8494' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e8494' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
