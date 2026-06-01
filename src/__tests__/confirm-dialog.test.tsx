import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '@/components/ConfirmDialog'

afterEach(() => {
  cleanup()
})

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(container.textContent).toBe('')
  })

  it('renders when open', () => {
    render(
      <ConfirmDialog
        open
        title="Delete Item"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Test"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    )
    await userEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows custom confirm label', () => {
    render(
      <ConfirmDialog
        open
        title="Test"
        message="Test message"
        confirmLabel="Yes, Delete"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
  })

  it('uses danger variant styles', () => {
    render(
      <ConfirmDialog
        open
        title="Test"
        message="Test message"
        variant="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    const button = screen.getByText('Confirm')
    expect(button.className).toContain('bg-red-600')
  })
})
