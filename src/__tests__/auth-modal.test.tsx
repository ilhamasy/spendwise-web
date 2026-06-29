import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthModal from '@/components/AuthModal'

let mockPush = vi.fn()
let mockLogin = vi.fn().mockResolvedValue(undefined)
let mockRegister = vi.fn().mockResolvedValue(undefined)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/LoadingProvider', () => ({
  useLoading: () => ({
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
  }),
  LoadingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  X: () => <span>✕</span>,
}))

describe('AuthModal', () => {
  beforeEach(() => {
    mockPush = vi.fn()
    mockLogin = vi.fn().mockResolvedValue(undefined)
    mockRegister = vi.fn().mockResolvedValue(undefined)
  })

  it('renders nothing when closed', () => {
    const { container } = render(<AuthModal open={false} onClose={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders login form by default', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders register form when switched', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Sign up'))
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('switches back to login from register', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Sign up'))
    fireEvent.click(screen.getByText('Sign in'))
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('calls onClose when X button clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal open={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when backdrop clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<AuthModal open={true} onClose={onClose} />)
    const backdrop = container.querySelector('.bg-black\\/40')
    if (backdrop) fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows register fields', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Sign up'))
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Min 8 characters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Re-enter password')).toBeInTheDocument()
  })

  it('clears form when switching modes', () => {
    render(<AuthModal open={true} onClose={vi.fn()} />)
    const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    expect(emailInput.value).toBe('test@test.com')

    fireEvent.click(screen.getByText('Sign up'))
    const newEmailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement
    expect(newEmailInput.value).toBe('')
  })
})
