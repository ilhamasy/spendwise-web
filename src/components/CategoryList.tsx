'use client'

import { useState, useEffect, useRef } from 'react'
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react'
import type { Category } from '@/types'
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
} from '@/lib/category-service'
import { db } from '@/lib/db'
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

  async function moveCategory(dragId: string, targetId: string, targetType: string) {
    const sameType = categories.filter((c) => c.type === targetType)
    const fromIdx = sameType.findIndex((c) => c.id === dragId)
    const toIdx = sameType.findIndex((c) => c.id === targetId)
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return

    const reordered = [...sameType]
    const [item] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, item)
    reordered.forEach((c, i) => { c.order = i })

    const newCategories = categories.map((c) => {
      if (c.type === targetType) {
        const match = reordered.find((n) => n.id === c.id)
        if (match) return { ...c, order: match.order }
      }
      return c
    })
    setCategories(newCategories)
    await db.categories.bulkPut(newCategories)
    window.dispatchEvent(new Event('categories-updated'))
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
                  onDrop={(dragId, targetId) => moveCategory(dragId, targetId, 'expense')}
                />
              ))}
            </div>
          </div>
        )}

        {incomeCategories.length > 0 && (
          <div>
            <p className="mb-2 mt-3 text-xs font-medium text-green-500 uppercase">Income</p>
            <div className="space-y-1">
              {incomeCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={() => handleEdit(cat)}
                  onDelete={() => setDeleteTarget(cat)}
                  onDrop={(dragId, targetId) => moveCategory(dragId, targetId, 'income')}
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
  onDrop,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
  onDrop: (dragId: string, targetId: string) => void
}) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', category.id)
    e.dataTransfer.effectAllowed = 'move'
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '0.4'
  }

  function handleDragEnd(e: React.DragEvent) {
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '1'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const dragId = e.dataTransfer.getData('text/plain')
    if (dragId && dragId !== category.id) {
      onDrop(dragId, category.id)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex cursor-grab items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 transition-colors active:cursor-grabbing"
    >
      <div className="flex items-center gap-3">
        <GripVertical size={14} className="text-muted-foreground/40" />
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
          <>
            <button
              onClick={onEdit}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label={`Edit ${category.name}`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
