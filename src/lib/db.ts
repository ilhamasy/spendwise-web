import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, SavingGoal, GoalContribution, Budget } from '@/types'
import type { SyncQueueItem } from '@/lib/sync-types'

const db = new Dexie('SpendWiseDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  savingGoals: EntityTable<SavingGoal, 'id'>
  goalContributions: EntityTable<GoalContribution, 'id'>
  budgets: EntityTable<Budget, 'id'>
  syncQueue: EntityTable<SyncQueueItem, 'id'>
}

db.version(1).stores({
  transactions: 'id, type, categoryId, occurredAt, createdAt',
  categories: 'id, type',
  savingGoals: 'id, status, createdAt',
  goalContributions: 'id, goalId, date',
})

db.version(2).stores({
  transactions: 'id, type, categoryId, occurredAt, createdAt',
  categories: 'id, type',
  savingGoals: 'id, status, createdAt',
  goalContributions: 'id, goalId, date',
  budgets: 'id, categoryId, period',
})

db.version(3).stores({
  transactions: 'id, type, categoryId, occurredAt, createdAt',
  categories: 'id, type',
  savingGoals: 'id, status, createdAt',
  goalContributions: 'id, goalId, date',
  budgets: 'id, categoryId, period',
  syncQueue: '++id, entityType, entityId, operation, createdAt, retries',
})

db.version(4).stores({
  transactions: 'id, type, categoryId, occurredAt, createdAt',
  categories: 'id, type, order',
  savingGoals: 'id, status, createdAt',
  goalContributions: 'id, goalId, date',
  budgets: 'id, categoryId, period',
  syncQueue: '++id, entityType, entityId, operation, createdAt, retries',
})

export { db }
export type SpendWiseDB = typeof db
