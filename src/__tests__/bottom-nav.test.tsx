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
  it('renders all 5 navigation items', () => {
    render(<BottomNav />)
    // BottomNav renders two pills (light + dark mode), so each label appears twice
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Transactions').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Goals').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Budget').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Settings').length).toBeGreaterThanOrEqual(1)
  })

  it('highlights active route', () => {
    render(<BottomNav />)
    // Active link is indicated via aria-current="page" (color is in inline style, not className)
    const activeLinks = screen.getAllByRole('link', { current: 'page' })
    expect(activeLinks.length).toBeGreaterThanOrEqual(1)
    expect(activeLinks[0]).toHaveAttribute('href', '/dashboard')
  })
})
