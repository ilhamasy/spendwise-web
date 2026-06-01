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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getStartDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isInRange(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return d > s && d < e
}

function isDisabled(day: Date, minDate: string, maxDate: string): boolean {
  const min = new Date(minDate)
  const max = new Date(maxDate)
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  min.setHours(0, 0, 0, 0)
  max.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d < min || d > max
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DateRangePicker({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  const today = new Date()
  const [leftMonth, setLeftMonth] = useState(
    startDate ? startDate.getMonth() : today.getMonth(),
  )
  const [leftYear, setLeftYear] = useState(
    startDate ? startDate.getFullYear() : today.getFullYear(),
  )
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [picking, setPicking] = useState<'start' | 'end'>('start')
  const [activeInput, setActiveInput] = useState<'start' | 'end'>('start')

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear

  function prevMonth() {
    if (leftMonth === 0) {
      setLeftMonth(11)
      setLeftYear(leftYear - 1)
    } else {
      setLeftMonth(leftMonth - 1)
    }
  }

  function nextMonth() {
    if (leftMonth === 11) {
      setLeftMonth(0)
      setLeftYear(leftYear + 1)
    } else {
      setLeftMonth(leftMonth + 1)
    }
  }

  function handleDayClick(day: Date) {
    if (isDisabled(day, minDate, maxDate)) return

    if (picking === 'start' || !startDate) {
      onChange(day, null)
      setPicking('end')
      setActiveInput('end')
    } else {
      if (day < startDate) {
        onChange(day, null)
        setPicking('end')
        setActiveInput('end')
      } else {
        onChange(startDate, day)
        setPicking('start')
      }
    }
  }

  function handleHover(day: Date) {
    if (picking === 'end' && startDate && day >= startDate && !isDisabled(day, minDate, maxDate)) {
      setHoverDate(day)
    } else {
      setHoverDate(null)
    }
  }

  function getDayClass(day: Date, isCurrentMonth: boolean): string {
    if (!isCurrentMonth) return 'text-slate-300 pointer-events-none'
    if (isDisabled(day, minDate, maxDate)) return 'text-slate-300 pointer-events-none'

    const isStart = startDate && isSameDay(day, startDate)
    const isEnd = endDate && isSameDay(day, endDate)
    const inRange = isInRange(day, startDate, endDate)
    const inPreview = hoverDate && startDate && !endDate && day > startDate && day <= hoverDate

    if (isStart || isEnd || inRange || inPreview) {
      return 'bg-[#6E44FF] text-white rounded-full'
    }
    return 'text-slate-700 hover:bg-slate-100 rounded-full'
  }

  function renderMonth(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month)
    const startDay = getStartDay(year, month)
    const prevDaysInMonth = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)

    const cells: React.ReactElement[] = []

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i
      cells.push(
        <div key={`prev-${day}`} className="flex h-9 w-9 items-center justify-center text-xs text-slate-300">
          {day}
        </div>,
      )
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const cls = getDayClass(date, true)
      cells.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDayClick(date)}
          onMouseEnter={() => handleHover(date)}
          className={`flex h-9 w-9 items-center justify-center text-xs font-medium transition-colors ${cls}`}
        >
          {d}
        </button>,
      )
    }

    // Next month days to fill grid
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      cells.push(
        <div key={`next-${d}`} className="flex h-9 w-9 items-center justify-center text-xs text-slate-300">
          {d}
        </div>,
      )
    }

    return (
      <div>
        <h4 className="mb-3 text-center text-sm font-semibold text-slate-700">
          {MONTHS[month]} {year}
        </h4>
        <div className="mb-1 grid grid-cols-7">
          {DAYS.map((d) => (
            <div key={d} className="flex h-8 w-9 items-center justify-center text-[10px] font-medium text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    )
  }

  const canApply = startDate && endDate

  return (
    <div className="w-[680px] rounded-xl border border-border bg-white p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="rounded-lg bg-[#6E44FF] px-4 py-2 text-xs font-semibold text-white">
          Select Date
        </button>
        <p className="text-xs text-slate-500">
          Selected Range:{' '}
          <span className="font-medium text-slate-700">
            {startDate ? toDateStr(startDate) : '—'} - {endDate ? toDateStr(endDate) : '—'}
          </span>
        </p>
      </div>

      {/* Dual input fields */}
      <div className="mt-3 flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            readOnly
            value={startDate ? toDateStr(startDate) : ''}
            placeholder="Start date"
            onClick={() => { setActiveInput('start'); setPicking('start') }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none cursor-pointer ${
              activeInput === 'start' ? 'border-[#6E44FF] ring-1 ring-[#6E44FF]/30' : 'border-slate-200'
            }`}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            readOnly
            value={endDate ? toDateStr(endDate) : ''}
            placeholder="End date"
            onClick={() => { setActiveInput('end'); setPicking('end') }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none cursor-pointer ${
              activeInput === 'end' ? 'border-[#6E44FF] ring-1 ring-[#6E44FF]/30' : 'border-slate-200'
            }`}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded p-1 hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <select
            value={leftMonth}
            onChange={(e) => setLeftMonth(Number(e.target.value))}
            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={leftYear}
            onChange={(e) => setLeftYear(Number(e.target.value))}
            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600"
          >
            {Array.from({ length: 5 }, (_, i) => leftYear - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 mx-1">-</span>
          <span className="rounded border border-slate-100 px-2 py-1 text-xs text-slate-600 bg-slate-50">
            {MONTHS[rightMonth]} {rightYear}
          </span>
        </div>
        <button onClick={nextMonth} className="rounded p-1 hover:bg-slate-100">
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {/* Dual Calendar */}
      <div className="mt-4 grid grid-cols-2 gap-8">
        {renderMonth(leftYear, leftMonth)}
        {renderMonth(rightYear, rightMonth)}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() => canApply && onApply(startDate, endDate)}
          disabled={!canApply}
          className="rounded-lg bg-[#6E44FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5c35e0] disabled:opacity-50"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
