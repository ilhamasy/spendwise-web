import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/lib/db'

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
  },
}))

vi.mock('@/lib/api', () => ({
  api: {
    createCategory: vi.fn(() => Promise.resolve({ id: 'server-cat-123' })),
  },
}))

import {
  getAllCategories,
  getCategoryById,
  seedDefaultCategories,
  createCategory,
  updateCategory,
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
    expect(all.length).toBe(14) // 5 income + 9 expense defaults
  })

  it('all seeded categories are marked as default', async () => {
    await seedDefaultCategories()
    const all = await getAllCategories()
    expect(all.every((c) => c.isDefault)).toBe(true)
  })
})

describe('getCategoryById', () => {
  it('returns undefined for empty id', async () => {
    const res = await getCategoryById('')
    expect(res).toBeUndefined()
  })

  it('retrieves category by exact ID', async () => {
    const cat = await createCategory({ name: 'Gadgets', type: 'expense' })
    const found = await getCategoryById(cat.id)
    expect(found?.name).toBe('Gadgets')
  })

  it('retrieves category by case-insensitive name fallback', async () => {
    await createCategory({ name: 'Salary', type: 'income' })
    const found = await getCategoryById('salary')
    expect(found?.name).toBe('Salary')
  })

  it('retrieves category by partial name fallback', async () => {
    await createCategory({ name: 'Entertainment', type: 'expense' })
    const found = await getCategoryById('Entertain')
    expect(found?.name).toBe('Entertainment')
  })
})

describe('createCategory', () => {
  it('creates a non-default custom category offline', async () => {
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

  it('returns existing category if already present with same name and type', async () => {
    const first = await createCategory({ name: 'Bills', type: 'expense' })
    const second = await createCategory({ name: 'Bills', type: 'expense' })
    expect(second.id).toBe(first.id)
  })

  it('uses server ID when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const cat = await createCategory({ name: 'OnlineCat', type: 'income' })
    expect(cat.id).toBeTruthy()
  })
})

describe('updateCategory', () => {
  it('updates an existing category', async () => {
    const cat = await createCategory({ name: 'Tech', type: 'expense' })
    const updated = await updateCategory(cat.id, { name: 'Tech & Gadgets', color: '#00ff00' })
    expect(updated?.name).toBe('Tech & Gadgets')
    expect(updated?.color).toBe('#00ff00')
  })

  it('returns undefined when updating non-existent category', async () => {
    const res = await updateCategory('non-existent', { name: 'Test' })
    expect(res).toBeUndefined()
  })
})

describe('deleteCategory', () => {
  it('returns false for non-existent category', async () => {
    const res = await deleteCategory('non-existent')
    expect(res).toBe(false)
  })

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
