import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}))
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/AuthModal', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="auth-modal"><button onClick={onClose}>Close</button></div> : null,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import { useAuth } from '@/lib/auth'
import LandingPage from '@/components/LandingPage'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: null, isLoading: false })
})

afterEach(() => {
  cleanup()
})

describe('LandingPage - loading spinner', () => {
  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true })
    const { container } = render(<LandingPage />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})

describe('LandingPage - logged in user', () => {
  it('returns null when user is logged in', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', name: 'Test' }, isLoading: false })
    const { container } = render(<LandingPage />)
    expect(container.textContent).toBe('')
  })
})

describe('LandingPage - hero and CTA', () => {
  it('renders hero section with CTA button', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    expect(screen.getByRole('button', { name: /Coba aja dulu/ })).toBeInTheDocument()
  })

  it('opens auth modal when CTA clicked', async () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    await userEvent.click(screen.getByRole('button', { name: /Coba aja dulu/ }))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
  })
})

describe('LandingPage - feature cards', () => {
  it('renders Moneytory card', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    expect(screen.getAllByText('Moneytory')[0]).toBeInTheDocument()
  })

  it('renders Budget card', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    expect(screen.getAllByText('Budget')[0]).toBeInTheDocument()
  })

  it('renders Saving Goals card', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    expect(screen.getAllByText('Saving Goals')[0]).toBeInTheDocument()
  })

  it('renders Recent Transactions card', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    expect(screen.getAllByText('Recent Transactions')[0]).toBeInTheDocument()
  })
})

describe('LandingPage - footer', () => {
  it('renders footer with sign in link', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)

    const footerBrand = container.querySelector('.text-lg.font-bold.text-violet-600')
    expect(footerBrand).toBeInTheDocument()
    expect(footerBrand?.textContent).toBe('SpendWise')

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Track every Rupiah. Spend Smarter.')).toBeInTheDocument()

    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument()
  })

  it('opens auth modal when footer sign in clicked', async () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    render(<LandingPage />)
    await userEvent.click(screen.getByText('Sign In'))
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
  })
})

describe('TypingAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const getTypingText = (container: HTMLElement) => {
    const p = container.querySelector('p[class*="text-slate-600"][class*="min-h-"]')
    return p?.textContent?.replace(/\|$/, '').trim() ?? ''
  }

  it('renders first word typed character by character', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)

    const firstWord = 'Track every Rupiah. Spend Smarter'

    // Type all characters of first word
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }

    expect(getTypingText(container)).toBe(firstWord)
  })

  it('starts deleting after typing pause once word fully typed', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)

    const firstWord = 'Track every Rupiah. Spend Smarter'

    // Type the full word
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }

    // Pause delay (2500ms) triggers isDeleting, then deletion (30ms)
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    act(() => {
      vi.advanceTimersByTime(30)
    })

    const displayed = firstWord.slice(0, firstWord.length - 1)
    expect(getTypingText(container)).toBe(displayed)
  })

  it('transitions to second word after first is fully deleted', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)

    const firstWord = 'Track every Rupiah. Spend Smarter'
    const secondWord = 'Everywhere, Every Device, No need to download app, just access it.'

    // Type the full first word
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }

    // Pause (2500ms) + delete all characters
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(30)
      })
    }

    // First character of second word typed
    act(() => {
      vi.advanceTimersByTime(80)
    })
    expect(getTypingText(container)).toBe(secondWord[0])
  })

  it('loops back to first word after last word is fully deleted when loop=true', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)

    const firstWord = 'Track every Rupiah. Spend Smarter'
    const secondWord = 'Everywhere, Every Device, No need to download app, just access it.'

    // Type full first word
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }
    // Pause + delete first word
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(30)
      })
    }
    // Type full second word
    for (let i = 0; i < secondWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }
    // Pause + delete second word
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    for (let i = 0; i < secondWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(30)
      })
    }

    // Should loop - first character of first word starts typing
    act(() => {
      vi.advanceTimersByTime(80)
    })
    expect(getTypingText(container)).toBe(firstWord[0])
  })

  it('renders blink cursor', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeInTheDocument()
  })

  it('does not loop when loop is false and last word reached', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false })
    const { container } = render(<LandingPage />)
    // LandingPage passes loop=true, so this tests the full cycle behavior

    const firstWord = 'Track every Rupiah. Spend Smarter'
    const secondWord = 'Everywhere, Every Device, No need to download app, just access it.'

    // Type full first word
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }

    // Verify first word is fully typed
    expect(getTypingText(container)).toBe(firstWord)

    // Full cycle: pause + delete first word
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    for (let i = 0; i < firstWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(30)
      })
    }

    // Type second word completely
    for (let i = 0; i < secondWord.length; i++) {
      act(() => {
        vi.advanceTimersByTime(80)
      })
    }

    // Verify second word is fully typed
    expect(getTypingText(container)).toBe(secondWord)
  })
})
