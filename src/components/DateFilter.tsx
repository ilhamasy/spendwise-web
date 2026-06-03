'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import DateRangePicker from './DateRangePicker'

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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  const [startDate, setStartDate] = useState<Date | null>(customStart ? new Date(customStart) : null)
  const [endDate, setEndDate] = useState<Date | null>(customEnd ? new Date(customEnd) : null)
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

  function handleApply(start: Date, end: Date) {
    onPeriodChange('custom')
    onCustomChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
    setStartDate(start)
    setEndDate(end)
    setPickerOpen(false)
  }

  function handlePeriodClick(key: FilterPeriod) {
    setPickerOpen(false)
    onPeriodChange(key)
  }

  const hasCustomRange = period === 'custom' && customStart && customEnd
  const rangeLabel = hasCustomRange
    ? `${formatDateLabel(customStart)} - ${formatDateLabel(customEnd)}`
    : ''

  return (
    <div ref={pickerRef} className="relative">
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

        <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => setPickerOpen(!pickerOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <Calendar className="h-3.5 w-3.5" />
          </button>

          {pickerOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 sm:left-0 sm:translate-x-0" onMouseDown={(e) => e.stopPropagation()}>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                minDate={minDate}
                maxDate={today}
                onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
                onApply={handleApply}
                onCancel={() => setPickerOpen(false)}
              />
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
