'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/currency'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  year: number
  onYearChange: (year: number) => void
}

export default function MoneyFlowCard({ year, onYearChange }: Props) {
  const [data, setData] = useState<{ month: string; income: number; expense: number }[]>([])

  useEffect(() => {
    async function load() {
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
    }
    load()
  }, [year])

  const isEmpty = data.every((d) => d.income === 0 && d.expense === 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Money Flow</h3>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs text-muted-foreground"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
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
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
