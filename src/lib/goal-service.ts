import { db } from './db'
import type { SavingGoal, GoalContribution } from '@/types'
import { generateId } from './utils'
import { syncManager } from './sync-manager'
import { api } from './api'

export type CreateGoalInput = Omit<SavingGoal, 'id' | 'currentSaved' | 'createdAt' | 'updatedAt'>
export type UpdateGoalInput = Partial<
  Omit<SavingGoal, 'id' | 'currentSaved' | 'createdAt' | 'updatedAt'>
>

export async function getAllGoals(status?: 'active' | 'archived'): Promise<SavingGoal[]> {
  if (status) {
    return db.savingGoals.where('status').equals(status).reverse().sortBy('createdAt')
  }
  return db.savingGoals.orderBy('createdAt').reverse().toArray()
}

export async function getGoalById(id: string): Promise<SavingGoal | undefined> {
  return db.savingGoals.get(id)
}

export async function createGoal(input: CreateGoalInput): Promise<SavingGoal> {
  const now = new Date().toISOString()
  const goal: SavingGoal = {
    id: generateId(),
    ...input,
    currentSaved: 0,
    createdAt: now,
    updatedAt: now,
  }
  await db.savingGoals.add(goal)
  await syncManager.addToQueue({
    entityType: 'goal', entityId: goal.id, operation: 'CREATE',
    payload: goal, timestamp: now,
  })
  return goal
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput,
): Promise<SavingGoal | undefined> {
  const existing = await db.savingGoals.get(id)
  if (!existing) return undefined

  const updated: SavingGoal = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  }
  await db.savingGoals.put(updated)
  await syncManager.addToQueue({
    entityType: 'goal', entityId: id, operation: 'UPDATE',
    payload: updated, timestamp: updated.updatedAt,
  })
  return updated
}

export async function archiveGoal(id: string): Promise<SavingGoal | undefined> {
  return updateGoal(id, { status: 'archived' })
}

export async function unarchiveGoal(id: string): Promise<SavingGoal | undefined> {
  return updateGoal(id, { status: 'active' })
}

export async function deleteGoal(id: string): Promise<boolean> {
  const existing = await db.savingGoals.get(id)
  if (!existing) return false
  await db.savingGoals.delete(id)
  await db.goalContributions.where('goalId').equals(id).delete()
  await syncManager.addToQueue({
    entityType: 'goal', entityId: id, operation: 'DELETE',
    payload: { id }, timestamp: new Date().toISOString(),
  })
  return true
}

export async function addContribution(
  goalId: string,
  amount: number,
  note?: string,
  date?: string,
): Promise<{ contribution: GoalContribution; goal: SavingGoal } | null> {
  const goal = await db.savingGoals.get(goalId)
  if (!goal) return null

  const now = new Date().toISOString()
  const contribution: GoalContribution = {
    id: generateId(),
    goalId,
    amount,
    note,
    date: date || now.split('T')[0],
    createdAt: now,
  }

  goal.currentSaved += amount
  goal.updatedAt = now

  let syncedToServer = false
  if (navigator.onLine) {
    try {
      await api.addContribution(goalId, { amount, note, date })
      await api.updateGoal(goalId, { currentSaved: goal.currentSaved })
      syncedToServer = true
    } catch {
      // API failed, use local + queue for later sync
    }
  }

  await db.goalContributions.add(contribution)
  await db.savingGoals.put(goal)

  if (!syncedToServer) {
    await syncManager.addToQueue({
      entityType: 'goal', entityId: goal.id, operation: 'UPDATE',
      payload: goal, timestamp: now,
    })
  }

  return { contribution, goal }
}

export async function getGoalContributions(goalId: string): Promise<GoalContribution[]> {
  return db.goalContributions.where('goalId').equals(goalId).reverse().sortBy('date')
}

export async function getTotalSavings(): Promise<number> {
  const goals = await db.savingGoals.where('status').equals('active').toArray()
  return goals.reduce((sum, g) => sum + g.currentSaved, 0)
}
