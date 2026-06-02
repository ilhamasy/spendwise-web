'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  minDate: string
  maxDate: string
  onChange: (start: Date | null, end: Date | null) => void
  onApply: (start: Date, end: Date) => void
  onCancel: () => void
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getStartDay(year: number, month: number) { return new Date(year, month, 1).getDay() }

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isInRange(day: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return d > s && d < e
}

function isDisabled(day: Date, minDate: string, maxDate: string) {
  const d = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())
  const min = new Date(minDate + 'T00:00:00').getTime()
  const max = new Date(maxDate + 'T00:00:00').getTime()
  return d < min || d > max
}

export default function DateRangePicker({
  startDate, endDate, minDate, maxDate, onChange, onApply, onCancel,
}: DateRangePickerProps) {
  const today = new Date()
  const [month, setMonth] = useState(startDate?.getMonth() ?? today.getMonth())
  const [year, setYear] = useState(startDate?.getFullYear() ?? today.getFullYear())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [picking, setPicking] = useState<'start' | 'end'>('start')

  function shiftMonths(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  function handleDayClick(day: Date) {
    if (isDisabled(day, minDate, maxDate)) return
    if (picking === 'start' || !startDate) {
      onChange(day, null)
      setPicking('end')
    } else {
      onChange(day < startDate ? day : startDate, day < startDate ? null : day)
      if (day < startDate) setPicking('end')
    }
  }

  function getDayClass(day: Date, isCurrentMonth: boolean) {
    if (!isCurrentMonth || isDisabled(day, minDate, maxDate)) return 'text-muted-foreground/30 pointer-events-none'
    const isStart = startDate && isSameDay(day, startDate)
    const isEnd = endDate && isSameDay(day, endDate)
    const inRange = isInRange(day, startDate, endDate)
    const inPreview = hoverDate && startDate && !endDate && day > startDate && day <= hoverDate
    if (isStart || isEnd || inRange || inPreview) return 'bg-primary text-white'
    return 'text-foreground hover:bg-primary-light'
  }

  function renderMonth(m: number, y: number) {
    const daysInMonth = getDaysInMonth(y, m)
    const startDay = getStartDay(y, m)
    const prevDaysInMonth = getDaysInMonth(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1)
    const cells: React.ReactElement[] = []

    for (let i = startDay - 1; i >= 0; i--) {
      cells.push(<div key={`p-${i}`} className="flex h-7 w-7 items-center justify-center text-[10px] text-muted-foreground/20">{prevDaysInMonth - i}</div>)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d)
      cells.push(
        <button key={d} type="button" onClick={() => handleDayClick(date)} onMouseEnter={() => setHoverDate(date)}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${getDayClass(date, true)}`}>
          {d}
        </button>,
      )
    }
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push(<div key={`n-${d}`} className="flex h-7 w-7 items-center justify-center text-[10px] text-muted-foreground/20">{d}</div>)
    }

    return (
      <div>
        <p className="mb-1.5 text-center text-xs font-semibold text-foreground">{MONTHS[m]} {y}</p>
        <div className="mb-0.5 grid grid-cols-7">
          {DAY_HEADERS.map((d) => (<div key={d} className="flex h-6 w-7 items-center justify-center text-[10px] font-medium text-muted-foreground">{d}</div>))}
        </div>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    )
  }

  const canApply = startDate && endDate

  return (
    <div className="w-[300px] rounded-2xl border border-border bg-card p-4 shadow-xl">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button onClick={() => shiftMonths(-1)} className="rounded p-0.5 hover:bg-muted"><ChevronLeft className="h-3.5 w-3.5" /></button>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded border-border bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground">
          {MONTHS.map((m, i) => (<option key={m} value={i}>{m}</option>))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded border-border bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground">
          {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>
        <button onClick={() => shiftMonths(1)} className="rounded p-0.5 hover:bg-muted"><ChevronRight className="h-3.5 w-3.5" /></button>
        <p className="ml-auto text-[10px] text-muted-foreground">
          {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} – {endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </p>
      </div>

      {/* Calendar */}
      <div className="mt-3">
        {renderMonth(month, year)}
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-end gap-2 border-t border-border pt-3">
        <button onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted">Cancel</button>
        <button onClick={() => canApply && onApply(startDate!, endDate!)} disabled={!canApply}
          className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary/90 disabled:opacity-50">Apply</button>
      </div>
    </div>
  )
}
