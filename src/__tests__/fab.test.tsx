import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FAB from '@/components/FAB'

const mockPathname = vi.fn(() => '/dashboard')
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

describe('FAB', () => {
  it('renders on dashboard page', () => {
    mockPathname.mockReturnValue('/dashboard')
    render(<FAB />)
    expect(screen.getByLabelText('Add transaction')).toBeInTheDocument()
  })

  it('renders on transactions page', () => {
    mockPathname.mockReturnValue('/transactions')
    render(<FAB />)
    expect(screen.getByLabelText('Add transaction')).toBeInTheDocument()
  })

  it('does not render on settings page', () => {
    mockPathname.mockReturnValue('/settings')
    render(<FAB />)
    expect(screen.queryByLabelText('Add transaction')).not.toBeInTheDocument()
  })
})
