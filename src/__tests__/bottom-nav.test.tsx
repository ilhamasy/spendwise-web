import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import BottomNav from '@/components/BottomNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

afterEach(() => {
  cleanup()
})

describe('BottomNav', () => {
  it('renders all 4 navigation items', () => {
    render(<BottomNav />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('highlights active route', () => {
    render(<BottomNav />)
    const links = screen.getAllByText('Dashboard')
    const dashboardLink = links[0].closest('a')
    expect(dashboardLink?.className).toContain('text-primary')
  })
})
