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
  getAllCategories,
  seedDefaultCategories,
  createCategory,
  deleteCategory,
} from '@/lib/category-service'

beforeEach(async () => {
  await db.categories.clear()
  Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
})

describe('seedDefaultCategories', () => {
  it('seeds default categories when table is empty', async () => {
    await seedDefaultCategories()
    const all = await getAllCategories()
    expect(all.length).toBeGreaterThan(0)

    const income = await getAllCategories('income')
    const expense = await getAllCategories('expense')
    expect(income.length).toBeGreaterThan(0)
    expect(expense.length).toBeGreaterThan(0)
  })

  it('does not duplicate seeds when called again', async () => {
    await seedDefaultCategories()
    await seedDefaultCategories()
    const all = await getAllCategories()
    expect(all.length).toBe(13) // 5 income + 8 expense defaults
  })

  it('all seeded categories are marked as default', async () => {
    await seedDefaultCategories()
    const all = await getAllCategories()
    expect(all.every((c) => c.isDefault)).toBe(true)
  })
})

describe('createCategory', () => {
  it('creates a non-default custom category', async () => {
    const cat = await createCategory({
      name: 'Subscription',
      type: 'expense',
      icon: 'credit-card',
      color: '#ff0000',
    })

    expect(cat.id).toBeTruthy()
    expect(cat.isDefault).toBe(false)
    expect(cat.name).toBe('Subscription')
  })
})

describe('deleteCategory', () => {
  it('prevents deleting default categories', async () => {
    await seedDefaultCategories()
    const all = await getAllCategories()
    const defaultCat = all[0]

    const result = await deleteCategory(defaultCat.id)
    expect(result).toBe(false)
  })

  it('deletes custom categories', async () => {
    const cat = await createCategory({ name: 'Custom', type: 'expense', icon: 'star', color: '#000' })
    const result = await deleteCategory(cat.id)
    expect(result).toBe(true)

    const found = await getAllCategories()
    expect(found.find((c) => c.id === cat.id)).toBeUndefined()
  })
})
