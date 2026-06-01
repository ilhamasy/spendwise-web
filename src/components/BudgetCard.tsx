'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const DATA = [
  { name: 'Cafe & Restaurant', value: 35, color: '#6e44ff' },
  { name: 'Entertainment', value: 25, color: '#f59e0b' },
  { name: 'Shopping', value: 20, color: '#22c55e' },
  { name: 'Transport', value: 12, color: '#3b82f6' },
  { name: 'Health', value: 8, color: '#ef4444' },
]

export default function BudgetCard() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">Budget</h3>

      <div className="relative mt-4 flex flex-1 items-center justify-center">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={96}
                dataKey="value"
                strokeWidth={0}
              >
                {DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Total for month</p>
          <p className="text-lg font-bold text-foreground">$5,950</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {DATA.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
