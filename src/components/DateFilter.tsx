'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

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
    return { start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, end: today }
  }
  return { start: `${now.getFullYear()}-01-01`, end: today }
}

export function getFilterDateRange(
  period: FilterPeriod,
  customStart: string,
  customEnd: string,
): { start: string; end: string } {
  if (period === 'custom') return { start: customStart, end: customEnd }
  return getDateRange(period)
}

export function getChartYear(period: FilterPeriod, customStart: string, customEnd: string): number {
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

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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
  const [start, setStart] = useState(customStart)
  const [end, setEnd] = useState(customEnd)
  const [error, setError] = useState('')
  const today = new Date().toISOString().split('T')[0]

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    const s = e.target.value
    setStart(s)
    if (s && end) {
      validateAndApply(s, end)
    }
  }

  function handleEndChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    const e2 = e.target.value
    setEnd(e2)
    if (start && e2) {
      validateAndApply(start, e2)
    }
  }

  function validateAndApply(s: string, e2: string) {
    if (new Date(s) > new Date(e2)) {
      setError('Start date must be before end date')
      return
    }
    const diff = (new Date(e2).getTime() - new Date(s).getTime()) / 86400000
    if (diff > 365) {
      setError('Date range cannot exceed 365 days')
      return
    }
    if (new Date(s) < new Date(minDate)) {
      setError('Start date cannot be before first transaction')
      return
    }
    setError('')
    onPeriodChange('custom')
    onCustomChange(s, e2)
  }

  function handlePeriodClick(key: FilterPeriod) {
    if (key !== 'custom') {
      setError('')
      onPeriodChange(key)
    }
    // 'custom' is triggered by date picker change, not button click
  }

  const hasCustomRange = period === 'custom' && customStart && customEnd
  const rangeLabel = hasCustomRange
    ? `${formatDateLabel(customStart)} - ${formatDateLabel(customEnd)}`
    : ''

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePeriodClick(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              period === key
                ? 'bg-primary text-white'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
          <Calendar className="h-3.5 w-3.5" />
          <input
            type="date"
            value={start}
            min={minDate}
            max={end || today}
            onChange={handleStartChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
        <span className="mx-1 text-xs text-muted-foreground">to</span>
        <div className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
          <Calendar className="h-3.5 w-3.5" />
          <input
            type="date"
            value={end}
            min={start || minDate}
            max={today}
            onChange={handleEndChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>

        {hasCustomRange && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1.5 text-xs font-medium text-primary">
            {rangeLabel}
            <button
              onClick={() => onPeriodChange('year')}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
