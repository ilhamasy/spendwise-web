import { db } from './db'
import type { Budget } from '@/types'
import { generateId } from './utils'
import { syncManager } from './sync-manager'

export type CreateBudgetInput = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>

export async function getAllBudgets(): Promise<Budget[]> {
  return db.budgets.toArray()
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const now = new Date().toISOString()
  const budget: Budget = { id: generateId(), ...input, createdAt: now, updatedAt: now }
  await db.budgets.add(budget)
  await syncManager.addToQueue({
    entityType: 'budget', entityId: budget.id, operation: 'CREATE',
    payload: budget, timestamp: now,
  })
  return budget
}

export async function updateBudget(id: string, input: Partial<CreateBudgetInput>): Promise<Budget | undefined> {
  const existing = await db.budgets.get(id)
  if (!existing) return undefined
  const updated: Budget = { ...existing, ...input, updatedAt: new Date().toISOString() }
  await db.budgets.put(updated)
  await syncManager.addToQueue({
    entityType: 'budget', entityId: id, operation: 'UPDATE',
    payload: updated, timestamp: updated.updatedAt,
  })
  return updated
}

export async function deleteBudget(id: string): Promise<boolean> {
  const existing = await db.budgets.get(id)
  if (!existing) return false
  await db.budgets.delete(id)
  await syncManager.addToQueue({
    entityType: 'budget', entityId: id, operation: 'DELETE',
    payload: { id }, timestamp: new Date().toISOString(),
  })
  return true
}

function getPeriodRange(period: Budget['period']): { start: string; end: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  if (period === 'daily') return { start: today, end: today }
  if (period === 'weekly') {
    const day = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - day + 1)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] }
  }
  if (period === 'monthly') {
    return { start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, end: today }
  }
  return { start: `${now.getFullYear()}-01-01`, end: today }
}

export async function getBudgetSpent(budget: Budget): Promise<number> {
  const { start, end } = getPeriodRange(budget.period)
  const txs = await db.transactions.where('categoryId').equals(budget.categoryId).toArray()
  return txs
    .filter((t) => t.type === 'expense' && t.occurredAt >= start && t.occurredAt <= end)
    .reduce((s, t) => s + t.amount, 0)
}

export async function getBudgetWithSpent(budget: Budget): Promise<{ budget: Budget; spent: number; remaining: number; progress: number }> {
  const spent = await getBudgetSpent(budget)
  const remaining = budget.amount - spent
  const progress = Math.min(Math.round((spent / budget.amount) * 100), 100)
  return { budget, spent, remaining, progress }
}
