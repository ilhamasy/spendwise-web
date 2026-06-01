'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const DATA = [
  { month: 'Jan', income: 8000, expense: 6000 },
  { month: 'Feb', income: 9000, expense: 5500 },
  { month: 'Mar', income: 7500, expense: 7000 },
  { month: 'Apr', income: 10000, expense: 6500 },
  { month: 'May', income: 8500, expense: 7200 },
  { month: 'Jun', income: 9200, expense: 6800 },
]

export default function MoneyFlowCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Money Flow</h3>
        <div className="flex gap-2">
          <select className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs text-muted-foreground">
            <option>All accounts</option>
          </select>
          <select className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs text-muted-foreground">
            <option>This year</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary-light" />
          <span className="text-xs text-muted-foreground">Expense</span>
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} barGap={4} barCategoryGap={20}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e9ed" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e8494' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e8494' }} />
            <Bar dataKey="income" fill="#6e44ff" radius={[8, 8, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="#ebe5fc" radius={[8, 8, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
