'use client'

import { useState } from 'react'
import type { Category } from '@/types'
import { CATEGORY_EMOJIS, DEFAULT_CATEGORY_COLORS } from '@/lib/constants'

interface CategoryModalProps {
  open: boolean
  category?: Category | null
  onSave: (data: { name: string; type: 'income' | 'expense'; icon: string; color: string }) => void
  onClose: () => void
}

export default function CategoryModal({ open, category, onSave, onClose }: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'income' | 'expense'>(category?.type || 'expense')
  const [emoji, setEmoji] = useState(category?.icon || '💰')
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

    const key = name.trim().toLowerCase().split(' ')[0]
    const color = DEFAULT_CATEGORY_COLORS[key] || '#6366f1'

    onSave({ name: name.trim(), type, icon: emoji, color })
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
              className="mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
            <label className="block text-sm font-medium text-foreground">Emoji</label>
            <div className="mt-2 grid grid-cols-10 gap-1">
              {CATEGORY_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                    emoji === e
                      ? 'bg-primary-light ring-2 ring-primary scale-110'
                      : 'hover:bg-muted'
                  }`}
                >
                  {e}
                </button>
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
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              {isEditing ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
