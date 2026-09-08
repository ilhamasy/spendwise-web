import { db } from './db'
import type { Transaction } from '@/types'
import { generateId } from './utils'
import { syncManager } from './sync-manager'
import { api } from './api'

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>

export async function getAllTransactions(): Promise<Transaction[]> {
  const txns = await db.transactions.orderBy('occurredAt').reverse().toArray()
  return sortByDateTime(txns)
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  return db.transactions.get(id)
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Transaction[]> {
  const txns = await db.transactions
    .where('occurredAt')
    .between(startDate, endDate, true, true)
    .reverse()
    .sortBy('occurredAt')
  return sortByDateTime(txns)
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
  const txns = await db.transactions.orderBy('occurredAt').reverse().limit(limit * 2).toArray()
  return sortByDateTime(txns).slice(0, limit)
}

function sortByDateTime(txns: Transaction[]): Transaction[] {
  return txns.sort((a, b) => {
    if (a.occurredAt !== b.occurredAt) {
      return b.occurredAt.localeCompare(a.occurredAt)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const now = new Date().toISOString()
  const localId = generateId()
  const transaction: Transaction = {
    id: localId,
    ...input,
    createdAt: now,
    updatedAt: now,
  }

  if (navigator.onLine) {
    try {
      const serverTxn = await retry(() => api.createTransaction({
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId,
        occurredAt: input.occurredAt,
        note: input.note,
      }), 2)
      transaction.id = serverTxn.id
      await db.transactions.add(transaction)
      // Successfully synced online — no need to queue
      return transaction
    } catch {
      // API failed while online — save locally and queue for later sync
      await db.transactions.add(transaction)
      await syncManager.addToQueue({
        entityType: 'transaction', entityId: localId, operation: 'CREATE',
        payload: transaction, timestamp: now,
      })
      return transaction
    }
  }

  // Offline path
  await db.transactions.add(transaction)
  await syncManager.addToQueue({
    entityType: 'transaction', entityId: localId, operation: 'CREATE',
    payload: transaction, timestamp: now,
  })
  return transaction
}

async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn()
    } catch {
      if (i === attempts) throw new Error('All retries failed')
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('All retries failed')
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

  if (navigator.onLine) {
    try {
      await api.updateTransaction(id, {
        type: updated.type,
        amount: updated.amount,
        categoryId: updated.categoryId,
        occurredAt: updated.occurredAt,
        note: updated.note,
      })
      // Synced online — no queue needed
      return updated
    } catch {
      // API failed — queue for later
    }
  }

  await syncManager.addToQueue({
    entityType: 'transaction', entityId: id, operation: 'UPDATE',
    payload: updated, timestamp: updated.updatedAt,
  })
  return updated
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const existing = await db.transactions.get(id)
  if (!existing) return false
  await db.transactions.delete(id)

  if (navigator.onLine) {
    try {
      await api.deleteTransaction(id)
      // Synced online — no queue needed
      return true
    } catch {
      // API failed — queue for later
    }
  }

  await syncManager.addToQueue({
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
