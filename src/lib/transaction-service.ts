import { db } from './db'
import type { Transaction } from '@/types'
import { generateId } from './utils'
import { syncManager } from './sync-manager'

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>

export async function getAllTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy('occurredAt').reverse().toArray()
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return db.transactions.get(id)
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Transaction[]> {
  return db.transactions
    .where('occurredAt')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('occurredAt')
}

export async function getTransactionsByMonth(
  year: number,
  month: number,
): Promise<Transaction[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]
  return getTransactionsByDateRange(start, end)
}

export async function getTransactionsByYear(year: number): Promise<Transaction[]> {
  return getTransactionsByDateRange(`${year}-01-01`, `${year}-12-31`)
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  return db.transactions.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const now = new Date().toISOString()
  const transaction: Transaction = {
    id: generateId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  await db.transactions.add(transaction)
  syncManager.addToQueue({
    entityType: 'transaction', entityId: transaction.id, operation: 'CREATE',
    payload: transaction, timestamp: now,
  })
  return transaction
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<Transaction | undefined> {
  const existing = await db.transactions.get(id)
  if (!existing) return undefined

  const updated: Transaction = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  }
  await db.transactions.put(updated)
  syncManager.addToQueue({
    entityType: 'transaction', entityId: id, operation: 'UPDATE',
    payload: updated, timestamp: updated.updatedAt,
  })
  return updated
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const existing = await db.transactions.get(id)
  if (!existing) return false
  await db.transactions.delete(id)
  syncManager.addToQueue({
    entityType: 'transaction', entityId: id, operation: 'DELETE',
    payload: { id }, timestamp: new Date().toISOString(),
  })
  return true
}

export async function getTotalIncome(startDate?: string, endDate?: string): Promise<number> {
  const all = await db.transactions.toArray()
  if (startDate && endDate) {
    return all
      .filter((t) => t.type === 'income' && t.occurredAt >= startDate && t.occurredAt <= endDate)
      .reduce((sum, t) => sum + t.amount, 0)
  }
  return all.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
}

export async function getTotalExpense(startDate?: string, endDate?: string): Promise<number> {
  const all = await db.transactions.toArray()
  if (startDate && endDate) {
    return all
      .filter((t) => t.type === 'expense' && t.occurredAt >= startDate && t.occurredAt <= endDate)
      .reduce((sum, t) => sum + t.amount, 0)
  }
  return all.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
}
