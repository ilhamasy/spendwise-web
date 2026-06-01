'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

export type FilterPeriod = 'week' | 'month' | 'year' | 'custom'

interface DateFilterProps {
  period: FilterPeriod
  customStart: string
  customEnd: string
  minDate: string
  onPeriodChange: (period: FilterPeriod) => void
  onCustomChange: (start: string, end: string) => void
}

function getDateRange(period: FilterPeriod): { start: string; end: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  if (period === 'week') {
    const day = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - day + 1)
    return { start: monday.toISOString().split('T')[0], end: today }
  }

  if (period === 'month') {
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    return { start, end: today }
  }

  if (period === 'year') {
    return { start: `${now.getFullYear()}-01-01`, end: today }
  }

  return { start: '', end: '' }
}

export function getFilterDateRange(
  period: FilterPeriod,
  customStart: string,
  customEnd: string,
): { start: string; end: string } {
  if (period === 'custom') {
    return { start: customStart, end: customEnd }
  }
  return getDateRange(period)
}

export function getChartYear(
  period: FilterPeriod,
  customStart: string,
  customEnd: string,
): number {
  if (period !== 'custom') return new Date().getFullYear()

  const start = new Date(customStart)
  const end = new Date(customEnd)
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  if (startYear === endYear) return startYear

  const startMonths = 12 - start.getMonth()
  const endMonths = end.getMonth() + 1
  return startMonths >= endMonths ? startYear : endYear
}

const PERIODS: { key: FilterPeriod; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
]

export default function DateFilter({
  period,
  customStart,
  customEnd,
  minDate,
  onPeriodChange,
  onCustomChange,
}: DateFilterProps) {
  const [showPicker, setShowPicker] = useState(period === 'custom')
  const [start, setStart] = useState(customStart || new Date().toISOString().split('T')[0])
  const [end, setEnd] = useState(customEnd || new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  function applyCustom() {
    setError('')
    if (!start || !end) {
      setError('Select both dates')
      return
    }
    if (new Date(start) > new Date(end)) {
      setError('Start date must be before end date')
      return
    }
    const diffDays = (new Date(end).getTime() - new Date(start).getTime()) / 86400000
    if (diffDays > 365) {
      setError('Date range cannot exceed 365 days')
      return
    }
    if (new Date(start) < new Date(minDate)) {
      setError('Start date cannot be before first transaction')
      return
    }
    onCustomChange(start, end)
    setShowPicker(false)
  }

  function handlePeriodClick(key: FilterPeriod) {
    if (key === 'custom') {
      setShowPicker(true)
    } else {
      setShowPicker(false)
    }
    onPeriodChange(key)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePeriodClick(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              period === key && !showPicker
                ? 'bg-primary text-white'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => handlePeriodClick('custom')}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            period === 'custom'
              ? 'bg-primary text-white'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Custom
        </button>
      </div>

      {showPicker && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Start</label>
            <input
              type="date"
              value={start}
              min={minDate}
              max={end}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">End</label>
            <input
              type="date"
              value={end}
              min={start || minDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={applyCustom}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setShowPicker(false)
              if (period === 'custom') onPeriodChange('year')
            }}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          {error && <p className="w-full text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
