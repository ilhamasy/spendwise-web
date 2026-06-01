'use client'

import { useState } from 'react'
import type { Category } from '@/types'

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#64748b', '#78716c',
]

interface CategoryModalProps {
  open: boolean
  category?: Category | null
  onSave: (data: { name: string; type: 'income' | 'expense'; icon: string; color: string }) => void
  onClose: () => void
}

export default function CategoryModal({ open, category, onSave, onClose }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'income' | 'expense'>(category?.type || 'expense')
  const [color, setColor] = useState(category?.color || '#6366f1')
  const [error, setError] = useState('')

  const isEditing = !!category

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Category name is required')
      return
    }
    if (name.trim().length > 50) {
      setError('Category name must be 50 characters or less')
      return
    }

    onSave({ name: name.trim(), type, icon: 'tag', color })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-card p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-foreground">
          {isEditing ? 'Edit Category' : 'Add Category'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Category name"
              maxLength={50}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Type</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Color</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              {isEditing ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
