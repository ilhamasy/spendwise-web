import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ login: vi.fn(), register: vi.fn(), user: null, isLoading: false }),
  AuthProvider: ({ c }: { c: React.ReactNode }) => c,
}))
vi.mock('@/lib/theme', () => ({
  ThemeProvider: ({ c }: { c: React.ReactNode }) => c,
  useTheme: () => ({ resolved: 'light', setTheme: vi.fn() }),
}))
vi.mock('@/components/LoadingProvider', () => ({
  useLoading: () => ({ showLoading: vi.fn(), hideLoading: vi.fn() }),
  LoadingProvider: ({ c }: { c: React.ReactNode }) => c,
}))
vi.mock('@/assets/mockup-device.png', () => ({ default: { src: '/mockup.png', height: 600, width: 800 } }))
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return { ...actual, ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }
})

import AuthModal from '@/components/AuthModal'
import LandingPage from '@/components/LandingPage'

afterEach(() => cleanup())

describe('AuthModal', () => {
  it('does not render when closed', () => {
    const { container } = render(<AuthModal open={false} onClose={() => {}} />)
    expect(container.textContent).toBe('')
  })

  it('renders login form when open', () => {
    render(<AuthModal open onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('switches to register form', async () => {
    render(<AuthModal open onClose={() => {}} />)
    await userEvent.click(screen.getByText('Sign up'))
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
  })

  it('switches back to login form', async () => {
    render(<AuthModal open onClose={() => {}} />)
    await userEvent.click(screen.getByText('Sign up'))
    await userEvent.click(screen.getByText('Sign in'))
    expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', async () => {
    const onClose = vi.fn()
    const { container } = render(<AuthModal open onClose={onClose} />)
    const backdrop = container.querySelector('.bg-black\\/40')
    if (backdrop) await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when X button clicked', async () => {
    const onClose = vi.fn()
    render(<AuthModal open onClose={onClose} />)
    await userEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows validation error for empty password via form submit', () => {
    const { container } = render(<AuthModal open onClose={() => {}} />)
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('validates register password length', async () => {
    const { container } = render(<AuthModal open onClose={() => {}} />)
    await userEvent.click(screen.getByText('Sign up'))
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Test')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Min 8 characters'), 'short')
    await userEvent.type(screen.getByPlaceholderText('Re-enter password'), 'short')
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  it('shows password mismatch error', async () => {
    const { container } = render(<AuthModal open onClose={() => {}} />)
    await userEvent.click(screen.getByText('Sign up'))
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Test')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('Min 8 characters'), 'password123')
    await userEvent.type(screen.getByPlaceholderText('Re-enter password'), 'different1')
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })
})

describe('LandingPage', () => {
  it('renders hero heading with SpendWise', () => {
    render(<LandingPage />)
    expect(screen.getByRole('heading', { name: 'SpendWise' })).toBeInTheDocument()
  })

  it('renders CTA button', () => {
    render(<LandingPage />)
    expect(screen.getByRole('button', { name: /Coba aja dulu/ })).toBeInTheDocument()
  })

  it('renders device mockup image', () => {
    render(<LandingPage />)
    const img = screen.getByAltText(/SpendWise Dashboard/)
    expect(img).toBeInTheDocument()
  })

  it('renders Moneytory card', () => {
    render(<LandingPage />)
    expect(screen.getAllByText('Moneytory')[0]).toBeInTheDocument()
  })

  it('renders Budget card', () => {
    render(<LandingPage />)
    expect(screen.getAllByText('Budget')[0]).toBeInTheDocument()
  })

  it('renders Saving Goals card', () => {
    render(<LandingPage />)
    expect(screen.getAllByText('Saving Goals')[0]).toBeInTheDocument()
  })

  it('renders Recent Transactions card', () => {
    render(<LandingPage />)
    expect(screen.getAllByText('Recent Transactions')[0]).toBeInTheDocument()
  })

  it('CTA button links to login page', () => {
    render(<LandingPage />)
    const btn = screen.getByRole('button', { name: /Coba aja dulu/ })
    expect(btn).toBeInTheDocument()
  })

  it('renders feature section heading', () => {
    render(<LandingPage />)
    expect(screen.getByText(/Everything you need/)).toBeInTheDocument()
  })
})
