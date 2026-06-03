'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/currency'
import type { FilterPeriod } from '@/components/DateFilter'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  year: number
  period: FilterPeriod
  customStart: string
  customEnd: string
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
          <span className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.name === 'income' ? '#22c55e' : '#ef4444' }} />
          <span className="text-muted-foreground capitalize">{entry.name}</span>
          <span className="ml-auto font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date
}

function getWeekLabel(start: Date): string {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`
}

export default function MoneyFlowCard({ year, period, customStart, customEnd }: Props) {
  const [data, setData] = useState<{ label: string; income: number; expense: number }[]>([])

  const loadData = useCallback(async () => {
    const all = await db.transactions.toArray()

    if (period === 'week') {
      const monday = getMonday(new Date())
      const weekData = DAYS.map((day, i) => {
        const d = new Date(monday)
        d.setDate(d.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        const dayTx = all.filter((t) => t.occurredAt === dateStr)
        return {
          label: day,
          income: dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        }
      })
      setData(weekData)
    } else if (period === 'month') {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const weeks: { label: string; start: Date; end: Date }[] = []
      let cursor = getMonday(firstDay)

      while (cursor.getMonth() <= now.getMonth() || weeks.length < 5) {
        const end = new Date(cursor)
        end.setDate(end.getDate() + 6)
        weeks.push({ label: `Week ${weeks.length + 1}`, start: new Date(cursor), end })
        cursor = new Date(end)
        cursor.setDate(cursor.getDate() + 1)
        if (weeks.length >= 5) break
      }

      setData(weeks.map((w) => {
        const s = w.start.toISOString().split('T')[0]
        const e = w.end.toISOString().split('T')[0]
        const weekTx = all.filter((t) => t.occurredAt >= s && t.occurredAt <= e)
        return {
          label: w.label,
          income: weekTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: weekTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        }
      }))
    } else {
      const start = customStart || `${year}-01-01`
      const end = customEnd || `${year}-12-31`
      const startDate = new Date(start)
      const endDate = new Date(end)
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1

      if (monthsDiff <= 12) {
        const result = []
        for (let i = 0; i < monthsDiff; i++) {
          const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const prefix = `${d.getFullYear()}-${m}`
          const monthTx = all.filter((t) => t.occurredAt.startsWith(prefix))
          result.push({
            label: `${MONTHS[d.getMonth()]}${period === 'year' ? '' : ` ${d.getFullYear()}`}`,
            income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
          })
        }
        setData(result)
      } else {
        const yearly = all.filter((t) => t.occurredAt.startsWith(String(year)))
        setData(MONTHS.map((month, i) => {
          const m = String(i + 1).padStart(2, '0')
          const monthTx = yearly.filter((t) => t.occurredAt.slice(5, 7) === m)
          return { label: month, income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) }
        }))
      }
    }
  }, [year, period, customStart, customEnd])

  useEffect(() => { loadData() }, [loadData])
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
        <span className="text-xs text-muted-foreground">
          {period === 'week' ? 'This week' : period === 'month' ? 'This month' : year}
        </span>
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
          No data for this period
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e9ed" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#7e8494' }} />
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
