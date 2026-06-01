'use client'

import { useState, useEffect } from 'react'
import type { Category } from '@/types'
import { getAllCategories, createCategory, seedDefaultCategories } from '@/lib/category-service'
import { createTransaction } from '@/lib/transaction-service'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/currency'
import CategoryModal from './CategoryModal'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_DATES = Array.from({ length: 28 }, (_, i) => i + 1)

interface Props {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddTransactionModal({ open, onClose, onSuccess }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fix income fields
  const [isFixIncome, setIsFixIncome] = useState(false)
  const [payrollType, setPayrollType] = useState<'weekly' | 'monthly'>('weekly')
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 7)
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())

  const [categories, setCategories] = useState<Category[]>([])
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [catModalType, setCatModalType] = useState<'income' | 'expense'>('expense')

  useEffect(() => {
    if (open) {
      seedDefaultCategories().then(() => {
        getAllCategories().then(setCategories)
      })
    }
  }, [open])

  const filteredCategories = categories.filter((c) => c.type === type)
  const amount = parseCurrencyInput(amountDisplay)

  function computeNextIncome(): string {
    const now = new Date()
    if (payrollType === 'weekly') {
      const currentDay = now.getDay() || 7
      let daysUntil = selectedDay - currentDay
      if (daysUntil <= 0) daysUntil += 7
      const next = new Date(now)
      next.setDate(next.getDate() + daysUntil)
      return next.toLocaleDateString('en-GB')
    } else {
      const next = new Date(now.getFullYear(), now.getMonth(), selectedDate)
      if (next <= now) {
        next.setMonth(next.getMonth() + 1)
      }
      return next.toLocaleDateString('en-GB')
    }
  }

  function resetForm() {
    setType('expense')
    setCategoryId('')
    setAmountDisplay('')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
    setIsFixIncome(false)
    setPayrollType('weekly')
    setIsSubmitting(false)
    setError('')
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    if (!categoryId) {
      setError('Please select a category')
      return
    }

    setIsSubmitting(true)
    try {
      await createTransaction({
        type,
        amount,
        categoryId,
        occurredAt: date,
        note: note || undefined,
      })
      resetForm()
      onSuccess?.()
      onClose()
    } catch {
      setError('Failed to save transaction')
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-foreground">Add Transaction</h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </p>
            )}

            {/* Type toggle */}
            <div>
              <label className="block text-sm font-medium text-foreground">Type</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setType('expense'); setCategoryId('') }}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => { setType('income'); setCategoryId('') }}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">Category</label>
                <button
                  type="button"
                  onClick={() => { setCatModalType(type); setCatModalOpen(true) }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  + Add Category
                </button>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      categoryId === cat.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#6366f1' }}
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
              {filteredCategories.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">No categories available</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground">Amount (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  const num = Number(raw) || 0
                  setAmountDisplay(num > 0 ? formatCurrencyInput(num) : '')
                }}
                className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-foreground">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-foreground">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="What is this for?"
                maxLength={200}
              />
            </div>

            {/* Fix Income */}
            {type === 'income' && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFixIncome}
                    onChange={(e) => setIsFixIncome(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-foreground">Fix Income</span>
                </label>

                {isFixIncome && (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPayrollType('weekly')}
                        className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          payrollType === 'weekly'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayrollType('monthly')}
                        className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          payrollType === 'monthly'
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>

                    {payrollType === 'weekly' && (
                      <div className="flex flex-wrap gap-1">
                        {DAYS.map((day, i) => {
                          const dayNum = i + 1
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setSelectedDay(dayNum)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                                selectedDay === dayNum
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-border text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {payrollType === 'monthly' && (
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(Number(e.target.value))}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                      >
                        {MONTH_DATES.map((d) => (
                          <option key={d} value={d}>
                            Date {d}
                          </option>
                        ))}
                      </select>
                    )}

                    <p className="text-xs font-medium text-red-500">
                      Next income: {computeNextIncome()}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CategoryModal
        open={catModalOpen}
        category={null}
        onSave={async (data) => {
          const cat = await createCategory({ name: data.name, type: catModalType, icon: data.icon, color: data.color })
          setCategories((prev) => [...prev, cat])
          setCategoryId(cat.id)
          setCatModalOpen(false)
        }}
        onClose={() => setCatModalOpen(false)}
      />
    </>
  )
}
