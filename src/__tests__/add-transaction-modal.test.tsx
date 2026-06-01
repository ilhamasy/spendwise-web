import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddTransactionModal from '@/components/AddTransactionModal'

afterEach(() => {
  cleanup()
})

describe('AddTransactionModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <AddTransactionModal open={false} onClose={() => {}} />,
    )
    expect(container.textContent).toBe('')
  })

  it('renders when open', () => {
    render(<AddTransactionModal open onClose={() => {}} />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    expect(screen.getByText('Expense')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('has expense selected by default', () => {
    render(<AddTransactionModal open onClose={() => {}} />)
    const expenseBtn = screen.getByText('Expense')
    expect(expenseBtn.className).toContain('bg-red-50')
  })

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn()
    render(<AddTransactionModal open onClose={onClose} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('switches to income and shows fix income option', async () => {
    render(<AddTransactionModal open onClose={() => {}} />)
    await userEvent.click(screen.getByText('Income'))
    // Fix Income checkbox should appear for income type
    expect(screen.getByText('Fix Income')).toBeInTheDocument()
  })

  it('shows validation error when amount is 0', async () => {
    render(<AddTransactionModal open onClose={() => {}} />)
    await userEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument()
  })
})
