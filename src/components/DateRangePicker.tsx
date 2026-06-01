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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
  return d < new Date(minDate).getTime() || d > new Date(maxDate).getTime()
}

export default function DateRangePicker({
  startDate, endDate, minDate, maxDate, onChange, onApply, onCancel,
}: DateRangePickerProps) {
  const today = new Date()
  const [leftMonth, setLeftMonth] = useState(startDate?.getMonth() ?? today.getMonth())
  const [leftYear, setLeftYear] = useState(startDate?.getFullYear() ?? today.getFullYear())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [picking, setPicking] = useState<'start' | 'end'>('start')

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear

  function shiftMonths(delta: number) {
    let m = leftMonth + delta
    let y = leftYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setLeftMonth(m)
    setLeftYear(y)
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

  function renderMonth(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month)
    const startDay = getStartDay(year, month)
    const prevDaysInMonth = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)
    const cells: React.ReactElement[] = []

    for (let i = startDay - 1; i >= 0; i--) {
      cells.push(<div key={`p-${i}`} className="flex h-7 w-7 items-center justify-center text-[10px] text-muted-foreground/20">{prevDaysInMonth - i}</div>)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
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
        <p className="mb-1.5 text-center text-xs font-semibold text-foreground">{MONTHS[month]} {year}</p>
        <div className="mb-0.5 grid grid-cols-7">
          {DAY_HEADERS.map((d) => (<div key={d} className="flex h-6 w-7 items-center justify-center text-[10px] font-medium text-muted-foreground">{d}</div>))}
        </div>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    )
  }

  const canApply = startDate && endDate

  return (
    <div className="w-full sm:w-[520px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <button className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
          Select Date
        </button>
        <p className="text-[10px] text-muted-foreground">
          Selected: {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} – {endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={() => shiftMonths(-1)} className="rounded p-0.5 hover:bg-muted"><ChevronLeft className="h-3.5 w-3.5" /></button>
        <select value={leftMonth} onChange={(e) => setLeftMonth(Number(e.target.value))} className="rounded border-border bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground">
          {MONTHS.map((m, i) => (<option key={m} value={i}>{m}</option>))}
        </select>
        <select value={leftYear} onChange={(e) => setLeftYear(Number(e.target.value))} className="rounded border-border bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground">
          {Array.from({ length: 5 }, (_, i) => leftYear - 2 + i).map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>
        <span className="text-muted-foreground text-xs">–</span>
        <span className="text-[11px] font-medium text-foreground">{MONTHS[rightMonth]} {rightYear}</span>
        <button onClick={() => shiftMonths(1)} className="rounded p-0.5 hover:bg-muted"><ChevronRight className="h-3.5 w-3.5" /></button>
      </div>

      {/* Dual Calendar */}
      <div className="mt-3">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {renderMonth(leftYear, leftMonth)}
          <div className="hidden sm:block">{renderMonth(rightYear, rightMonth)}</div>
        </div>
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
