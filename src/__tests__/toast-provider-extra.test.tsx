import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '@/components/ToastProvider'

vi.mock('lucide-react', () => ({
  CheckCircle: () => <span>✓</span>,
  XCircle: () => <span>✗</span>,
  X: () => <span>✕</span>,
}))

function TestButton({ type = 'success' as const, message = 'Test message' }: { type?: 'success' | 'error'; message?: string }) {
  const { showToast } = useToast()
  return <button onClick={() => showToast(message, type)}>Show</button>
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('ToastProvider - extra coverage', () => {
  it('shows toast when showToast called', async () => {
    render(
      <ToastProvider>
        <TestButton />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByText('Show'))
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('auto-dismisses toast after 3 seconds', async () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <TestButton />
      </ToastProvider>,
    )
    await act(async () => {
      fireEvent.click(screen.getByText('Show'))
    })
    expect(screen.getByText('Test message')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('manually dismisses toast on X click', async () => {
    render(
      <ToastProvider>
        <TestButton />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByText('Show'))
    expect(screen.getByText('Test message')).toBeInTheDocument()

    await userEvent.click(screen.getByText('✕'))
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('renders success toast with check icon', async () => {
    render(
      <ToastProvider>
        <TestButton type="success" message="Success!" />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByText('Show'))
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('renders error toast with XCircle icon', async () => {
    render(
      <ToastProvider>
        <TestButton type="error" message="Error!" />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByText('Show'))
    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('multiple toasts can exist simultaneously', async () => {
    function TwoButton() {
      const { showToast } = useToast()
      return (
        <>
          <button onClick={() => showToast('First', 'success')}>Show First</button>
          <button onClick={() => showToast('Second', 'error')}>Show Second</button>
        </>
      )
    }
    render(
      <ToastProvider>
        <TwoButton />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByText('Show First'))
    await userEvent.click(screen.getByText('Show Second'))

    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
