import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
  },
}))

import {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  archiveGoal,
  unarchiveGoal,
  deleteGoal,
  addContribution,
  getGoalContributions,
  getTotalSavings,
} from '@/lib/goal-service'

beforeEach(async () => {
  await db.savingGoals.clear()
  await db.goalContributions.clear()
})

describe('goal-service', () => {
  it('creates a goal with currentSaved = 0', async () => {
    const goal = await createGoal({
      name: 'New Car',
      targetAmount: 100000000,
      status: 'active',
    })

    expect(goal.id).toBeTruthy()
    expect(goal.currentSaved).toBe(0)
    expect(goal.status).toBe('active')
  })

  it('gets all active goals', async () => {
    await createGoal({ name: 'Goal 1', targetAmount: 1000, status: 'active' })
    await createGoal({ name: 'Goal 2', targetAmount: 2000, status: 'archived' })

    const active = await getAllGoals('active')
    expect(active).toHaveLength(1)
    expect(active[0].name).toBe('Goal 1')
  })

  it('archives and unarchives a goal', async () => {
    const goal = await createGoal({ name: 'Test', targetAmount: 1000, status: 'active' })

    const archived = await archiveGoal(goal.id)
    expect(archived!.status).toBe('archived')

    const unarchived = await unarchiveGoal(goal.id)
    expect(unarchived!.status).toBe('active')
  })

  it('updates a goal', async () => {
    const goal = await createGoal({ name: 'Old Name', targetAmount: 1000, status: 'active' })

    const updated = await updateGoal(goal.id, { name: 'New Name', targetAmount: 2000 })
    expect(updated!.name).toBe('New Name')
    expect(updated!.targetAmount).toBe(2000)
  })

  it('adds contribution and updates currentSaved', async () => {
    const goal = await createGoal({ name: 'Savings', targetAmount: 100000, status: 'active' })

    const result = await addContribution(goal.id, 25000, 'First deposit')
    expect(result).toBeTruthy()
    expect(result!.goal.currentSaved).toBe(25000)

    const updated = await getGoalById(goal.id)
    expect(updated!.currentSaved).toBe(25000)
  })

  it('retrieves contribution history', async () => {
    const goal = await createGoal({ name: 'Savings', targetAmount: 100000, status: 'active' })
    await addContribution(goal.id, 10000, 'Deposit 1')
    await addContribution(goal.id, 15000, 'Deposit 2')

    const history = await getGoalContributions(goal.id)
    expect(history).toHaveLength(2)
    // Verify both contributions exist regardless of order
    const amounts = history.map((h) => h.amount).sort((a, b) => b - a)
    expect(amounts).toEqual([15000, 10000])
  })

  it('deletes goal and its contributions', async () => {
    const goal = await createGoal({ name: 'To Delete', targetAmount: 1000, status: 'active' })
    await addContribution(goal.id, 500)

    await deleteGoal(goal.id)

    const found = await getGoalById(goal.id)
    expect(found).toBeUndefined()

    const contributions = await getGoalContributions(goal.id)
    expect(contributions).toHaveLength(0)
  })

  it('calculates total savings from all active goals', async () => {
    const g1 = await createGoal({ name: 'G1', targetAmount: 1000, status: 'active' })
    const g2 = await createGoal({ name: 'G2', targetAmount: 2000, status: 'active' })
    await createGoal({ name: 'G3', targetAmount: 3000, status: 'archived' })

    await addContribution(g1.id, 500)
    await addContribution(g2.id, 300)

    const total = await getTotalSavings()
    expect(total).toBe(800) // only active goals
  })
})
