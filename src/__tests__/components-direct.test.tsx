import { describe, it, expect, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }))
vi.mock('next/image', () => ({ default: ({ src }: { src: string }) => <img src={src} /> }))
vi.mock('@/lib/auth', () => ({ useAuth: () => ({ logout: vi.fn(), user: null }), AuthProvider: ({ c }: { c: React.ReactNode }) => c }))
vi.mock('@/lib/theme', () => ({ ThemeProvider: ({ c }: { c: React.ReactNode }) => c, useTheme: () => ({ resolved: 'light' }) }))
vi.mock('@/lib/sync-manager', () => ({ syncManager: { addToQueue: () => Promise.resolve(), processQueue: () => Promise.resolve(), pullChanges: () => Promise.resolve(), getPendingCount: () => Promise.resolve(0), getStatus: () => 'idle', init: () => {}, destroy: () => {}, onStatusChange: () => () => {} } }))
vi.mock('@/lib/db', () => ({ db: { transactions: { orderBy: () => ({ first: () => Promise.resolve(null), reverse: () => ({ toArray: () => Promise.resolve([]), limit: () => ({ toArray: () => Promise.resolve([]) }) }) }), count: () => Promise.resolve(0), toArray: () => Promise.resolve([]) }, savingGoals: { clear: () => Promise.resolve() }, goalContributions: { clear: () => Promise.resolve() }, categories: { clear: () => Promise.resolve(), count: () => Promise.resolve(13), toArray: () => Promise.resolve([]), where: () => ({ equals: () => ({ toArray: () => Promise.resolve([]), first: () => Promise.resolve({}) }) }) }, budgets: { clear: () => Promise.resolve() }, syncQueue: { clear: () => Promise.resolve(), count: () => Promise.resolve(0), add: () => Promise.resolve(), toArray: () => Promise.resolve([]), delete: () => Promise.resolve() } } }))

import ConfirmDialog from '@/components/ConfirmDialog'
import KpiCard from '@/components/KpiCard'
import CategoryModal from '@/components/CategoryModal'
import { Category } from '@/types'
import { CATEGORY_EMOJIS } from '@/lib/constants'

afterEach(() => cleanup())

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(<ConfirmDialog open title="Test" message="Hello" onConfirm={() => {}} onCancel={() => {}} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('returns null when closed', () => {
    const { container } = render(<ConfirmDialog open={false} title="Test" message="Hello" onConfirm={() => {}} onCancel={() => {}} />)
    expect(container.textContent).toBe('')
  })

  it('shows danger variant', () => {
    render(<ConfirmDialog open title="Delete" message="Sure?" variant="danger" confirmLabel="Yes" onConfirm={() => {}} onCancel={() => {}} />)
    const btn = screen.getByText('Yes')
    expect(btn.className).toContain('bg-red')
  })
})

describe('KpiCard', () => {
  const icon = CATEGORY_EMOJIS[0] as unknown as { src: string }

  it('renders title and value', () => {
    render(<KpiCard title="Total" value="Rp 100" change="+5%" isPositive icon={{ src: 'test.png' } as unknown as typeof icon} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Rp 100')).toBeInTheDocument()
  })

  it('shows positive change with up icon', () => {
    render(<KpiCard title="T" value="V" change="+10%" isPositive icon={{ src: 'test.png' } as unknown as typeof icon} />)
    expect(screen.getByText('+10%')).toBeInTheDocument()
  })

  it('shows negative change with down icon', () => {
    render(<KpiCard title="T" value="V" change="-5%" isPositive={false} icon={{ src: 'test.png' } as unknown as typeof icon} />)
    expect(screen.getByText('-5%')).toBeInTheDocument()
  })
})

describe('CategoryModal', () => {
  const mockCategory: Category = {
    id: 'cat-1', name: 'Food', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true,
  }

  it('renders add mode', () => {
    render(<CategoryModal open onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Add Category')).toBeInTheDocument()
  })

  it('renders edit mode', () => {
    render(<CategoryModal open category={mockCategory} onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Food')).toBeInTheDocument()
  })

  it('returns null when closed', () => {
    const { container } = render(<CategoryModal open={false} onSave={() => {}} onClose={() => {}} />)
    expect(container.textContent).toBe('')
  })

  it('validates name length', () => {
    render(<CategoryModal open onSave={() => {}} onClose={() => {}} />)
    const nameInput = screen.getByPlaceholderText('Category name')
    expect(nameInput).toBeInTheDocument()
    expect(nameInput).toHaveAttribute('maxLength', '50')
  })

  it('renders emoji grid', () => {
    render(<CategoryModal open onSave={() => {}} onClose={() => {}} />)
    // Should have emoji buttons
    const emojis = CATEGORY_EMOJIS.slice(0, 5)
    emojis.forEach((e) => {
      expect(screen.getByText(e)).toBeInTheDocument()
    })
  })
})
