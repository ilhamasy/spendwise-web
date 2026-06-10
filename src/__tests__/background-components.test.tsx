import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockPathname = vi.fn(() => '/dashboard')
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/lib/theme', () => ({
  useTheme: () => ({ resolved: 'light', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/lib/sync-manager', () => ({
  syncManager: {
    addToQueue: () => Promise.resolve(),
    processQueue: () => Promise.resolve(),
    pullChanges: () => Promise.resolve(),
    getPendingCount: () => Promise.resolve(0),
    getStatus: () => 'idle',
    init: () => {},
    destroy: () => {},
    onStatusChange: () => () => {},
  },
}))

describe('AppBackground', () => {
  it('renders children on dashboard', async () => {
    mockPathname.mockReturnValue('/dashboard')
    const { default: AppBackground } = await import('@/components/AppBackground')
    render(<AppBackground><div data-testid="child">Content</div></AppBackground>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('skips background on auth pages', async () => {
    mockPathname.mockReturnValue('/')
    const { default: AppBackground } = await import('@/components/AppBackground')
    const { container } = render(<AppBackground><div>Auth</div></AppBackground>)
    expect(container.textContent).toBe('Auth')
  })
})

describe('AuthBackground', () => {
  it('renders children', async () => {
    const { default: AuthBackground } = await import('@/components/AuthBackground')
    render(<AuthBackground><div data-testid="child">Login</div></AuthBackground>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})

describe('Loader', () => {
  it('renders overlay', async () => {
    const { default: Loader } = await import('@/components/Loader')
    const { container } = render(<Loader />)
    expect(container.firstChild).toBeTruthy()
  })
})
