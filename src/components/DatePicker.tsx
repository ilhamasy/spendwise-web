'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
   
  minDate?: string
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getStartDay(year: number, month: number) { return new Date(year, month, 1).getDay() }

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date()
  const initialDate = value ? new Date(value) : today
  const [month, setMonth] = useState(initialDate.getMonth())
  const [year, setYear] = useState(initialDate.getFullYear())

  function shiftMonths(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m)
    setYear(y)
  }

  function handleSelect(day: number) {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${year}-${m}-${d}`)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const startDay = getStartDay(year, month)
  const prevDaysInMonth = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1)
  const selected = value ? new Date(value) : null

  const cells: React.ReactElement[] = []
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push(<div key={`p-${i}`} className="flex h-7 w-7 items-center justify-center text-[10px] text-muted-foreground/20">{prevDaysInMonth - i}</div>)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
    cells.push(
      <button key={d} type="button" onClick={() => handleSelect(d)}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
          isSelected ? 'bg-primary text-white' : isToday ? 'text-primary font-bold' : 'text-foreground hover:bg-primary-light'
        }`}>
        {d}
      </button>,
    )
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push(<div key={`n-${d}`} className="flex h-7 w-7 items-center justify-center text-[10px] text-muted-foreground/20">{d}</div>)
  }

  return (
    <div className="w-full max-w-[320px] rounded-2xl border border-border bg-card p-3 shadow-xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => shiftMonths(-1)} className="rounded p-0.5 hover:bg-muted"><ChevronLeft className="h-3.5 w-3.5" /></button>
        <div className="flex items-center gap-1">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded border-border bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground">
            {MONTHS.map((m, i) => (<option key={m} value={i}>{m}</option>))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded border-border bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-foreground">
            {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
        </div>
        <button onClick={() => shiftMonths(1)} className="rounded p-0.5 hover:bg-muted"><ChevronRight className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-3">
        <div className="mb-0.5 grid grid-cols-7">
          {DAY_HEADERS.map((d) => (<div key={d} className="flex h-6 w-7 items-center justify-center text-[10px] font-medium text-muted-foreground">{d}</div>))}
        </div>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    </div>
  )
}
