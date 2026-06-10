import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
}))

vi.mock('@/lib/db', () => ({
  db: {
    transactions: {
      toArray: () => Promise.resolve([]),
      orderBy: () => ({ first: () => Promise.resolve(null), reverse: () => ({ toArray: () => Promise.resolve([]), limit: () => ({ toArray: () => Promise.resolve([]) }) }) }),
      add: () => Promise.resolve(''),
      where: () => ({ equals: () => ({ count: () => Promise.resolve(0), toArray: () => Promise.resolve([]) }) }),
    },
    categories: {
      count: () => Promise.resolve(13),
      toArray: () => Promise.resolve([
        { id: 'c1', name: 'Food', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
        { id: 'c2', name: 'Transport', type: 'expense', icon: '🚗', color: '#f97316', isDefault: true },
        { id: 'c3', name: 'Salary', type: 'income', icon: '💼', color: '#22c55e', isDefault: true },
      ]),
      where: () => ({ equals: () => ({ toArray: () => Promise.resolve([]) }) }),
      add: () => Promise.resolve(''),
    },
    syncQueue: { add: () => Promise.resolve(), clear: () => Promise.resolve() },
  },
}))

vi.mock('@/lib/currency', () => ({
  formatCurrency: (n: number) => `Rp ${n.toLocaleString('id-ID')}`,
  parseCurrencyInput: (v: string) => Number(v.replace(/\D/g, '')) || 0,
  formatCurrencyInput: (n: number) => n ? n.toLocaleString('id-ID') : '',
}))

vi.mock('@/lib/category-service', () => ({
  getAllCategories: () => Promise.resolve([
    { id: 'c1', name: 'Food', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
    { id: 'c2', name: 'Transport', type: 'expense', icon: '🚗', color: '#f97316', isDefault: true },
  ]),
  createCategory: (data: { name: string; type: string; icon: string; color: string }) =>
    Promise.resolve({ id: 'new-cat', name: data.name, type: data.type, icon: data.icon, color: data.color, isDefault: false }),
  seedDefaultCategories: () => Promise.resolve(),
}))

vi.mock('@/lib/transaction-service', () => ({
  createTransaction: () => Promise.resolve({ id: 'tx1', type: 'expense', amount: 50000, categoryId: 'c1', occurredAt: '', createdAt: '', updatedAt: '' }),
}))

beforeEach(() => {
  cleanup()
  localStorage.clear()
})

describe('AddTransactionModal - Render', () => {
  it('renders nothing when closed', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    const { container } = render(<AddTransactionModal open={false} onClose={() => {}} />)
    expect(container.textContent).toBe('')
  })

  it('renders when open with expense default', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('shows expense selected by default', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)
    const expenseBtn = screen.getByText('Expense')
    expect(expenseBtn.className).toContain('bg-red')
  })

  it('renders amount field', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
  })

  it('renders category grid', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)
    // Should show "Add Category" link
    expect(screen.getByText('+ Add Category')).toBeInTheDocument()
  })

  it('renders date field', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)
    // Date input exists
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThan(0)
  })

  it('renders note field', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)
    expect(screen.getByPlaceholderText('What is this for?')).toBeInTheDocument()
  })
})

describe('AddTransactionModal - Type switching', () => {
  it('switches to income shows fix income checkbox', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)

    await act(async () => {
      await userEvent.click(screen.getByText('Income'))
    })

    expect(screen.getByText('Fix Income')).toBeInTheDocument()
  })

  it('switching back to expense hides fix income', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)

    await act(async () => {
      await userEvent.click(screen.getByText('Income'))
    })
    expect(screen.getByText('Fix Income')).toBeInTheDocument()

    await act(async () => {
      await userEvent.click(screen.getByText('Expense'))
    })
    expect(screen.queryByText('Fix Income')).not.toBeInTheDocument()
  })
})

describe('AddTransactionModal - Fix income', () => {
  it('shows weekly/monthly toggle when fix income checked', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)

    await act(async () => {
      await userEvent.click(screen.getByText('Income'))
    })

    const checkbox = screen.getByRole('checkbox')
    await act(async () => {
      await userEvent.click(checkbox)
    })

    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('shows next income date', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)

    await act(async () => {
      await userEvent.click(screen.getByText('Income'))
    })
    await act(async () => {
      await userEvent.click(screen.getByRole('checkbox'))
    })

    expect(screen.getByText(/Next income:/)).toBeInTheDocument()
  })
})

describe('AddTransactionModal - Validation', () => {
  it('shows error when saving with 0 amount', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)

    await act(async () => {
      await userEvent.click(screen.getByText('Save'))
    })

    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument()
  })

  it('shows error when no category selected', async () => {
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={() => {}} />)

    // Enter amount but don't select category
    const input = screen.getByPlaceholderText('0')
    await act(async () => {
      await userEvent.type(input, '50000')
    })
    await act(async () => {
      await userEvent.click(screen.getByText('Save'))
    })

    expect(screen.getByText('Please select a category')).toBeInTheDocument()
  })
})

describe('AddTransactionModal - Cancel', () => {
  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn()
    const { default: AddTransactionModal } = await import('@/components/AddTransactionModal')
    render(<AddTransactionModal open onClose={onClose} />)

    await act(async () => {
      await userEvent.click(screen.getByText('Cancel'))
    })

    expect(onClose).toHaveBeenCalledOnce()
  })
})
