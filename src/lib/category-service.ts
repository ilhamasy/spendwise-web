import { db } from './db'
import type { Category } from '@/types'
import { generateId } from './utils'

const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#22c55e', isDefault: true },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#3b82f6', isDefault: true },
  { name: 'Investment', type: 'income', icon: 'trending-up', color: '#8b5cf6', isDefault: true },
  { name: 'Gift', type: 'income', icon: 'gift', color: '#f59e0b', isDefault: true },
  { name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#6b7280', isDefault: true },
]

const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', type: 'expense', icon: 'utensils', color: '#ef4444', isDefault: true },
  { name: 'Transport', type: 'expense', icon: 'car', color: '#f97316', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899', isDefault: true },
  { name: 'Bills', type: 'expense', icon: 'file-text', color: '#64748b', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#a855f7', isDefault: true },
  { name: 'Health', type: 'expense', icon: 'heart', color: '#14b8a6', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'book-open', color: '#eab308', isDefault: true },
  { name: 'Other', type: 'expense', icon: 'more-horizontal', color: '#78716c', isDefault: true },
]

export async function seedDefaultCategories(): Promise<void> {
  const count = await db.categories.count()
  if (count > 0) return

  const categories: Category[] = [
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, id: generateId() })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, id: generateId() })),
  ]
  await db.categories.bulkAdd(categories)
}

export async function getAllCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  if (type) {
    return db.categories.where('type').equals(type).toArray()
  }
  return db.categories.toArray()
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return db.categories.get(id)
}

export async function createCategory(
  input: Omit<Category, 'id' | 'isDefault'>,
): Promise<Category> {
  const category: Category = {
    id: generateId(),
    ...input,
    isDefault: false,
  }
  await db.categories.add(category)
  return category
}

export async function updateCategory(
  id: string,
  input: Partial<Omit<Category, 'id' | 'isDefault'>>,
): Promise<Category | undefined> {
  const existing = await db.categories.get(id)
  if (!existing) return undefined

  const updated: Category = { ...existing, ...input }
  await db.categories.put(updated)
  return updated
}

export async function deleteCategory(id: string): Promise<boolean> {
  const existing = await db.categories.get(id)
  if (!existing) return false
  if (existing.isDefault) return false
  await db.categories.delete(id)
  return true
}
