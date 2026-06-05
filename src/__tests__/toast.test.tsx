import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from '@/components/ToastProvider'

function TestButton() {
  const { showToast } = useToast()
  return <button onClick={() => showToast('Test message', 'success')}>Show</button>
}

afterEach(() => {
  cleanup()
})

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child</div>
      </ToastProvider>,
    )
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('shows success toast on click', async () => {
    render(
      <ToastProvider>
        <TestButton />
      </ToastProvider>,
    )
    await act(async () => {
      await userEvent.click(screen.getByText('Show'))
    })
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('showToast is accessible via context', () => {
    let captured: { showToast: (msg: string, type: 'success' | 'error') => void } | null = null
    function Capture() {
      // eslint-disable-next-line react-hooks/globals
      captured = useToast()
      return null
    }
    render(
      <ToastProvider>
        <Capture />
      </ToastProvider>,
    )
    expect(captured).not.toBeNull()
    expect(typeof captured!.showToast).toBe('function')
  })
})
