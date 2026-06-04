'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react'
import type { Budget, Category } from '@/types'
import { getAllBudgets, createBudget, updateBudget, deleteBudget, getBudgetWithSpent } from '@/lib/budget-service'
import { getAllCategories, seedDefaultCategories } from '@/lib/category-service'
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/currency'
import ConfirmDialog from '@/components/ConfirmDialog'

const PERIODS: { key: Budget['period']; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
]

interface BudgetWithStats {
  budget: Budget
  spent: number
  remaining: number
  progress: number
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetWithStats[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [budgetName, setBudgetName] = useState('')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState<Budget['period']>('monthly')
  const [budgetCategoryId, setBudgetCategoryId] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [budgetError, setBudgetError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)

  const loadData = useCallback(async () => {
    await seedDefaultCategories()
    const [allBudgets, cats] = await Promise.all([getAllBudgets(), getAllCategories('expense')])
    const stats = await Promise.all(allBudgets.map((b) => getBudgetWithSpent(b)))
    setBudgets(stats)
    setCategories(cats)
    setLoaded(true)
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const handler = () => loadData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [loadData])

  function openCreate() {
    setEditingBudget(null)
    setBudgetName('')
    setBudgetAmount('')
    setBudgetPeriod('monthly')
    setBudgetCategoryId('')
    setBudgetError('')
    setModalOpen(true)
  }

  function openEdit(b: BudgetWithStats) {
    setEditingBudget(b.budget)
    setBudgetName(b.budget.name)
    setBudgetAmount(formatCurrencyInput(b.budget.amount))
    setBudgetPeriod(b.budget.period)
    setBudgetCategoryId(b.budget.categoryId)
    setBudgetError('')
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBudgetError('')
    const amount = parseCurrencyInput(budgetAmount)
    if (!amount || amount <= 0) { setBudgetError('Amount must be greater than 0'); return }
    if (!budgetCategoryId) { setBudgetError('Select a category'); return }

    if (editingBudget) {
      await updateBudget(editingBudget.id, { name: budgetName.trim(), amount, period: budgetPeriod, categoryId: budgetCategoryId })
    } else {
      await createBudget({ name: budgetName.trim(), amount, period: budgetPeriod, categoryId: budgetCategoryId })
    }
    setModalOpen(false)
    loadData()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteBudget(deleteTarget.id)
    setDeleteTarget(null)
    loadData()
  }

  const getCat = (id: string) => categories.find((c) => c.id === id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Plan your spending by category.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90">
          <Plus size={14} /> New Budget
        </button>
      </div>

      {!loaded ? (
        <div className="space-y-3">{[1, 2].map((i) => (<div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />))}</div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Wallet className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">No budgets yet</p>
          <button onClick={openCreate} className="mt-2 text-xs text-primary hover:underline">Create your first budget</button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map(({ budget, spent, remaining, progress }) => {
            const cat = getCat(budget.categoryId)
            const isOver = remaining < 0
            const isWarning = progress >= 80 && !isOver
            const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
            const trackColor = isOver ? 'bg-red-100 dark:bg-red-950/30' : isWarning ? 'bg-amber-100 dark:bg-amber-950/30' : 'bg-green-100 dark:bg-green-950/30'
            return (
              <div key={budget.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat?.icon || '📁'}</span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{budget.name || cat?.name || 'Budget'}</h3>
                      <p className="text-xs text-muted-foreground">{cat?.name} · {PERIODS.find((p) => p.key === budget.period)?.label}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isOver ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' : isWarning ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
                  }`}>
                    {progress}%
                  </span>
                </div>

                <div className={`mt-3 h-2.5 w-full overflow-hidden rounded-full ${trackColor}`}>
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{formatCurrency(spent)} spent</span>
                  <span className={`font-medium ${isOver ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isOver ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
                  </span>
                </div>

                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => openEdit({ budget, spent, remaining, progress })}
                    className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setDeleteTarget(budget)}
                    className="ml-auto rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">{editingBudget ? 'Edit Budget' : 'New Budget'}</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {budgetError && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{budgetError}</p>}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground">Category</label>
                <button type="button" onClick={() => setCategoryOpen(!categoryOpen)}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground hover:border-primary transition-colors">
                  {budgetCategoryId ? (
                    <>
                      <span>{categories.find((c) => c.id === budgetCategoryId)?.icon || '📁'}</span>
                      <span>{categories.find((c) => c.id === budgetCategoryId)?.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Select category</span>
                  )}
                </button>
                {categoryOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
                    {categories.map((c) => (
                      <button key={c.id} type="button" onClick={() => { setBudgetCategoryId(c.id); setCategoryOpen(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <span>{c.icon || '📁'}</span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Amount (Rp)</label>
                <input type="text" inputMode="numeric" value={budgetAmount}
                  onChange={(e) => { const raw = e.target.value.replace(/\D/g, ''); setBudgetAmount(raw ? formatCurrencyInput(Number(raw)) : '') }}
                  className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Period</label>
                <div className="mt-1 flex gap-1">
                  {PERIODS.map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => setBudgetPeriod(key)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                        budgetPeriod === key ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Budget Name (Optional)</label>
                <input type="text" value={budgetName} onChange={(e) => setBudgetName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Food Budget" maxLength={100} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                  {editingBudget ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Budget" message={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
