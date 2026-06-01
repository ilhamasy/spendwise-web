import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAB from '@/components/FAB'

const mockPathname = vi.fn(() => '/dashboard')
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

afterEach(() => {
  cleanup()
})

describe('FAB', () => {
  it('renders on dashboard page', () => {
    mockPathname.mockReturnValue('/dashboard')
    render(<FAB />)
    expect(screen.getByLabelText('Add transaction')).toBeInTheDocument()
  })

  it('does not render on settings page', () => {
    mockPathname.mockReturnValue('/settings')
    render(<FAB />)
    expect(screen.queryByLabelText('Add transaction')).not.toBeInTheDocument()
  })

  it('opens modal on click', async () => {
    mockPathname.mockReturnValue('/dashboard')
    render(<FAB />)
    await userEvent.click(screen.getByLabelText('Add transaction'))
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
  })
})
