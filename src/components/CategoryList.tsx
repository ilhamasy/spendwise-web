'use client'

import { useState, useEffect, useRef } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import type { Category } from '@/types'
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from '@/lib/category-service'
import CategoryModal from './CategoryModal'
import ConfirmDialog from './ConfirmDialog'

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const mounted = useRef(false)

  async function loadCategories() {
    await seedDefaultCategories()
    const all = await getAllCategories()
    setCategories(all)
  }

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    loadCategories()
  })

  const incomeCategories = categories.filter((c) => c.type === 'income')
  const expenseCategories = categories.filter((c) => c.type === 'expense')

  function handleAdd() {
    setEditingCategory(null)
    setModalOpen(true)
  }

  function handleEdit(cat: Category) {
    setEditingCategory(cat)
    setModalOpen(true)
  }

  async function handleSave(data: { name: string; type: 'income' | 'expense'; icon: string; color: string }) {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data)
    } else {
      await createCategory(data)
    }
    setModalOpen(false)
    setEditingCategory(null)
    await loadCategories()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteCategory(deleteTarget.id)
    setDeleteTarget(null)
    await loadCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Categories</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="mt-3 space-y-4">
        {expenseCategories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-red-500 uppercase">Expense</p>
            <div className="space-y-1">
              {expenseCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={() => handleEdit(cat)}
                  onDelete={() => setDeleteTarget(cat)}
                />
              ))}
            </div>
          </div>
        )}

        {incomeCategories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-green-500 uppercase">Income</p>
            <div className="space-y-1">
              {incomeCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={() => handleEdit(cat)}
                  onDelete={() => setDeleteTarget(cat)}
                />
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No categories yet. Tap Add to create one.
          </p>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        onSave={handleSave}
        onClose={() => {
          setModalOpen(false)
          setEditingCategory(null)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?${
          deleteTarget?.isDefault ? ' This is a default category and cannot be deleted.' : ''
        }`}
        confirmLabel={deleteTarget?.isDefault ? 'Cannot Delete' : 'Delete'}
        variant="danger"
        onConfirm={deleteTarget?.isDefault ? () => setDeleteTarget(null) : handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="text-base">{category.icon || '📁'}</span>
        <span className="text-sm font-medium text-foreground">{category.name}</span>
        {category.isDefault && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            default
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!category.isDefault && (
          <button
            onClick={onEdit}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={`Edit ${category.name}`}
          >
            <Pencil size={14} />
          </button>
        )}
        {!category.isDefault && (
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
