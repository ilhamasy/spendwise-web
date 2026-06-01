import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CategoryModal from '@/components/CategoryModal'
import type { Category } from '@/types'

afterEach(() => {
  cleanup()
})

describe('CategoryModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <CategoryModal open={false} onSave={() => {}} onClose={() => {}} />,
    )
    expect(container.textContent).toBe('')
  })

  it('renders add mode correctly', () => {
    render(<CategoryModal open onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Add Category')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Category name')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('renders edit mode with pre-filled data', () => {
    const category: Category = {
      id: 'cat-1',
      name: 'Food',
      type: 'expense',
      color: '#ef4444',
      icon: 'tag',
      isDefault: true,
    }
    render(<CategoryModal open category={category} onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Food')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('shows error when name is empty', async () => {
    const onSave = vi.fn()
    render(<CategoryModal open onSave={onSave} onClose={() => {}} />)
    await userEvent.click(screen.getByText('Add'))
    expect(screen.getByText('Category name is required')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onSave with correct data', async () => {
    const onSave = vi.fn()
    render(<CategoryModal open onSave={onSave} onClose={() => {}} />)

    await userEvent.type(screen.getByPlaceholderText('Category name'), 'Subscriptions')
    await userEvent.click(screen.getByText('Add'))

    expect(onSave).toHaveBeenCalledWith({
      name: 'Subscriptions',
      type: 'expense',
      icon: 'tag',
      color: '#6366f1',
    })
  })

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn()
    render(<CategoryModal open onSave={() => {}} onClose={onClose} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
