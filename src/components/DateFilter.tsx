'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [error, setError] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    if (pickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [pickerOpen])

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
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 86400000
    if (diff > 365) {
      setError('Date range cannot exceed 365 days')
      return
    }
    if (new Date(start) < new Date(minDate)) {
      setError('Start date cannot be before first transaction')
      return
    }
    setError('')
    onPeriodChange('custom')
    onCustomChange(start, end)
    setPickerOpen(false)
  }

  function handlePeriodClick(key: FilterPeriod) {
    setPickerOpen(false)
    setError('')
    onPeriodChange(key)
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

        <div ref={pickerRef} className="relative">
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <Calendar className="h-3.5 w-3.5" />
          </button>

          {pickerOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">Start date</label>
                  <input
                    type="date"
                    value={start}
                    min={minDate}
                    max={end || today}
                    onChange={(e) => setStart(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">End date</label>
                  <input
                    type="date"
                    value={end}
                    min={start || minDate}
                    max={today}
                    onChange={(e) => setEnd(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={applyCustom}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setPickerOpen(false)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
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
    </div>
  )
}
