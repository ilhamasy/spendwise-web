'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Archive, RotateCcw, Trash2, PiggyBank, Calendar } from 'lucide-react'
import type { SavingGoal } from '@/types'
import {
  getAllGoals, createGoal, updateGoal, archiveGoal, unarchiveGoal,
  deleteGoal, addContribution,
} from '@/lib/goal-service'
import { createTransaction } from '@/lib/transaction-service'
import { getAllCategories } from '@/lib/category-service'
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/currency'
import ConfirmDialog from '@/components/ConfirmDialog'
import DatePicker from '@/components/DatePicker'

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const [loaded, setLoaded] = useState(false)

  // Create/Edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [goalError, setGoalError] = useState('')

  // Contribution
  const [contribGoal, setContribGoal] = useState<SavingGoal | null>(null)
  const [contribAmount, setContribAmount] = useState('')
  const [contribNote, setContribNote] = useState('')
  const [contribDebit, setContribDebit] = useState(false)
  const [contribError, setContribError] = useState('')

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SavingGoal | null>(null)

  const loadData = useCallback(async () => {
    const all = await getAllGoals(tab)
    setGoals(all)
    setLoaded(true)
  }, [tab])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  function openCreate() {
    setEditingGoal(null)
    setGoalName('')
    setGoalTarget('')
    setGoalDate('')
    setGoalError('')
    setModalOpen(true)
  }

  function openEdit(goal: SavingGoal) {
    setEditingGoal(goal)
    setGoalName(goal.name)
    setGoalTarget(formatCurrencyInput(goal.targetAmount))
    setGoalDate(goal.targetDate || '')
    setGoalError('')
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setGoalError('')
    const target = parseCurrencyInput(goalTarget)
    if (!goalName.trim()) { setGoalError('Name is required'); return }
    if (!target || target <= 0) { setGoalError('Target must be greater than 0'); return }

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        name: goalName.trim(),
        targetAmount: target,
        targetDate: goalDate || undefined,
      })
    } else {
      await createGoal({
        name: goalName.trim(),
        targetAmount: target,
        targetDate: goalDate || undefined,
        status: 'active',
      })
    }
    setModalOpen(false)
    loadData()
    window.dispatchEvent(new Event('transaction-updated'))
  }

  function openContribution(goal: SavingGoal) {
    setContribGoal(goal)
    setContribAmount('')
    setContribNote('')
    setContribDebit(false)
    setContribError('')
  }

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault()
    setContribError('')
    const amount = parseCurrencyInput(contribAmount)
    if (!amount || amount <= 0) { setContribError('Amount must be greater than 0'); return }
    if (!contribGoal) return

    await addContribution(contribGoal.id, amount, contribNote || undefined)

    if (contribDebit) {
      const cats = await getAllCategories('expense')
      const savingCat = cats.find((c) => c.name === 'Saving') || cats.find((c) => c.name === 'Other') || cats[0]
      await createTransaction({
        type: 'expense',
        amount,
        categoryId: savingCat?.id || '',
        occurredAt: new Date().toISOString().split('T')[0],
        note: `Savings: ${contribGoal.name}${contribNote ? ` - ${contribNote}` : ''}`,
      })
    }

    setContribGoal(null)
    loadData()
    window.dispatchEvent(new Event('transaction-updated'))
  }

  async function handleArchive(goal: SavingGoal) {
    await archiveGoal(goal.id)
    loadData()
    window.dispatchEvent(new Event('transaction-updated'))
  }

  async function handleUnarchive(goal: SavingGoal) {
    await unarchiveGoal(goal.id)
    loadData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteGoal(deleteTarget.id)
    setDeleteTarget(null)
    loadData()
    window.dispatchEvent(new Event('transaction-updated'))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saving Goals</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Set and track your saving goals.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90">
          <Plus size={14} /> New Goal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['active', 'archived'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setLoaded(false) }}
            className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-all ${
              tab === t ? 'bg-primary text-white' : 'border border-border bg-card text-muted-foreground hover:text-foreground'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {!loaded ? (
        <div className="space-y-3">{[1, 2].map((i) => (<div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />))}</div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <PiggyBank className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No {tab} goals</p>
          {tab === 'active' && (
            <button onClick={openCreate} className="mt-2 text-xs text-primary hover:underline">Create your first goal</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100)
            return (
              <div key={goal.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground">{goal.name}</h3>
                    {goal.targetDate && (
                      <p className="mt-0.5 text-xs text-muted-foreground">Target: {new Date(goal.targetDate).toLocaleDateString('en-GB')}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-bold text-foreground">{progress}%</span>
                </div>

                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-red-100 dark:bg-red-950/30">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                    style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(goal.currentSaved)} of {formatCurrency(goal.targetAmount)}
                  </p>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {tab === 'active' && (
                    <button onClick={() => openContribution(goal)}
                      className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary/90">
                      <Plus size={12} /> Add
                    </button>
                  )}
                  <button onClick={() => openEdit(goal)}
                    className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted">
                    <Pencil size={12} />
                  </button>
                  {tab === 'active' ? (
                    <button onClick={() => handleArchive(goal)}
                      className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted">
                      <Archive size={12} />
                    </button>
                  ) : (
                    <button onClick={() => handleUnarchive(goal)}
                      className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted">
                      <RotateCcw size={12} />
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(goal)}
                    className="ml-auto rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">{editingGoal ? 'Edit Goal' : 'New Goal'}</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {goalError && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{goalError}</p>}
              <div>
                <label className="block text-sm font-medium text-foreground">Name</label>
                <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. New Laptop" maxLength={100} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Target Amount (Rp)</label>
                <input type="text" inputMode="numeric" value={goalTarget}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    setGoalTarget(raw ? formatCurrencyInput(Number(raw)) : '')
                  }}
                  className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Target Date (optional)</label>
                <div className="relative mt-1">
                  <button type="button" onClick={() => setDatePickerOpen(!datePickerOpen)}
                    className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground hover:border-primary transition-colors">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {goalDate ? new Date(goalDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-muted-foreground">Select date</span>}
                  </button>
                  {datePickerOpen && (
                    <div className="absolute bottom-full right-0 z-50 mb-1" onMouseDown={(e) => e.stopPropagation()}>
                      <DatePicker value={goalDate} onChange={(d) => { setGoalDate(d); setDatePickerOpen(false) }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                  {editingGoal ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contribGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setContribGoal(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Add to {contribGoal.name}</h3>
            <form onSubmit={handleContribute} className="mt-4 space-y-4">
              {contribError && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{contribError}</p>}
              <div>
                <label className="block text-sm font-medium text-foreground">Amount (Rp)</label>
                <input type="text" inputMode="numeric" value={contribAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    setContribAmount(raw ? formatCurrencyInput(Number(raw)) : '')
                  }}
                  className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Note (optional)</label>
                <input type="text" value={contribNote} onChange={(e) => setContribNote(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. January savings" maxLength={200} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={contribDebit} onChange={(e) => setContribDebit(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Debit from balance</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setContribGoal(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Goal" message={`Delete "${deleteTarget?.name}"? All contributions will be removed.`}
        confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
