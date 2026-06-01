import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, SavingGoal, GoalContribution } from '@/types'

const db = new Dexie('SpendWiseDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  savingGoals: EntityTable<SavingGoal, 'id'>
  goalContributions: EntityTable<GoalContribution, 'id'>
}

db.version(1).stores({
  transactions: 'id, type, categoryId, occurredAt, createdAt',
  categories: 'id, type',
  savingGoals: 'id, status, createdAt',
  goalContributions: 'id, goalId, date',
})

export { db }
export type SpendWiseDB = typeof db
