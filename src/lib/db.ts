import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, SavingGoal, GoalContribution, Budget } from '@/types'

const db = new Dexie('SpendWiseDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  savingGoals: EntityTable<SavingGoal, 'id'>
  goalContributions: EntityTable<GoalContribution, 'id'>
  budgets: EntityTable<Budget, 'id'>
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

export { db }
export type SpendWiseDB = typeof db
