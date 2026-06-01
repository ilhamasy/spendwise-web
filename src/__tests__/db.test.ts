import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/lib/db'

beforeEach(async () => {
  await db.transactions.clear()
  await db.categories.clear()
  await db.savingGoals.clear()
  await db.goalContributions.clear()
})

describe('Database Schema', () => {
  it('opens the database successfully', () => {
    expect(db.name).toBe('SpendWiseDB')
  })

  it('has all required tables', () => {
    expect(db.transactions).toBeDefined()
    expect(db.categories).toBeDefined()
    expect(db.savingGoals).toBeDefined()
    expect(db.goalContributions).toBeDefined()
  })
})

describe('Transactions Table', () => {
  it('adds and retrieves a transaction', async () => {
    const id = await db.transactions.add({
      id: 'tx-1',
      type: 'expense',
      amount: 50000,
      categoryId: 'cat-1',
      occurredAt: '2026-06-01',
      note: 'Lunch',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    expect(id).toBe('tx-1')

    const tx = await db.transactions.get('tx-1')
    expect(tx).toBeTruthy()
    expect(tx!.amount).toBe(50000)
    expect(tx!.type).toBe('expense')
  })

  it('filters by type', async () => {
    await db.transactions.bulkAdd([
      {
        id: 'tx-1', type: 'income', amount: 100000, categoryId: 'cat-1',
        occurredAt: '2026-06-01', createdAt: '', updatedAt: '',
      },
      {
        id: 'tx-2', type: 'expense', amount: 50000, categoryId: 'cat-2',
        occurredAt: '2026-06-01', createdAt: '', updatedAt: '',
      },
    ])

    const income = await db.transactions.where('type').equals('income').toArray()
    expect(income).toHaveLength(1)
    expect(income[0].amount).toBe(100000)
  })

  it('updates a transaction', async () => {
    await db.transactions.add({
      id: 'tx-1', type: 'expense', amount: 50000, categoryId: 'cat-1',
      occurredAt: '2026-06-01', createdAt: '', updatedAt: '',
    })

    await db.transactions.put({
      id: 'tx-1', type: 'expense', amount: 75000, categoryId: 'cat-1',
      occurredAt: '2026-06-01', createdAt: '', updatedAt: new Date().toISOString(),
    })

    const tx = await db.transactions.get('tx-1')
    expect(tx!.amount).toBe(75000)
  })

  it('deletes a transaction', async () => {
    await db.transactions.add({
      id: 'tx-1', type: 'expense', amount: 50000, categoryId: 'cat-1',
      occurredAt: '2026-06-01', createdAt: '', updatedAt: '',
    })

    await db.transactions.delete('tx-1')
    const tx = await db.transactions.get('tx-1')
    expect(tx).toBeUndefined()
  })
})

describe('Categories Table', () => {
  it('adds and retrieves categories', async () => {
    await db.categories.bulkAdd([
      { id: 'cat-1', name: 'Food', type: 'expense', color: '#ef4444', isDefault: true },
      { id: 'cat-2', name: 'Salary', type: 'income', color: '#22c55e', isDefault: true },
    ])

    const all = await db.categories.toArray()
    expect(all).toHaveLength(2)

    const expenses = await db.categories.where('type').equals('expense').toArray()
    expect(expenses).toHaveLength(1)
  })
})

describe('SavingGoals Table', () => {
  it('adds and retrieves goals', async () => {
    await db.savingGoals.add({
      id: 'goal-1', name: 'New Laptop', targetAmount: 15000000, currentSaved: 5000000,
      status: 'active', createdAt: '', updatedAt: '',
    })

    const goal = await db.savingGoals.get('goal-1')
    expect(goal!.name).toBe('New Laptop')
    expect(goal!.targetAmount).toBe(15000000)
  })

  it('filters by status', async () => {
    await db.savingGoals.bulkAdd([
      { id: 'g1', name: 'Active', targetAmount: 1000, currentSaved: 0, status: 'active', createdAt: '', updatedAt: '' },
      { id: 'g2', name: 'Archived', targetAmount: 1000, currentSaved: 0, status: 'archived', createdAt: '', updatedAt: '' },
    ])

    const active = await db.savingGoals.where('status').equals('active').toArray()
    expect(active).toHaveLength(1)
    expect(active[0].name).toBe('Active')
  })
})

describe('GoalContributions Table', () => {
  it('links contributions to goals', async () => {
    await db.goalContributions.bulkAdd([
      { id: 'c1', goalId: 'goal-1', amount: 100000, date: '2026-06-01', createdAt: '' },
      { id: 'c2', goalId: 'goal-1', amount: 200000, date: '2026-06-02', createdAt: '' },
      { id: 'c3', goalId: 'goal-2', amount: 50000, date: '2026-06-01', createdAt: '' },
    ])

    const contributions = await db.goalContributions.where('goalId').equals('goal-1').toArray()
    expect(contributions).toHaveLength(2)
  })
})
