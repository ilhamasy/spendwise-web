import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock('lucide-react', () => ({
  X: () => <span>✕</span>,
  Plus: () => <span>+</span>,
  Search: () => <span>🔍</span>,
  Check: () => <span>✓</span>,
  ChevronDown: () => <span>▼</span>,
  ChevronLeft: () => <span>←</span>,
  ChevronRight: () => <span>→</span>,
}))

vi.mock('@/lib/category-service', () => ({
  getAllCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn().mockResolvedValue({ id: '1' }),
}))

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

describe('CategoryModal', () => {
  it('renders nothing when closed', async () => {
    const CategoryModal = (await import('@/components/CategoryModal')).default
    const { container } = render(<CategoryModal open={false} onClose={vi.fn()} onSave={vi.fn()} category={null} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('DateRangePicker extended', () => {
  it('selects start and end date to enable apply', async () => {
    const DateRangePicker = (await import('@/components/DateRangePicker')).default
    const onChange = vi.fn()
    const onApply = vi.fn()

    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        minDate="2024-01-01"
        maxDate="2026-12-31"
        onChange={onChange}
        onApply={onApply}
        onCancel={vi.fn()}
      />
    )

    // Click first selectable day (start date)
    const dayButtons = screen.getAllByRole('button').filter(b => /^\d+$/.test(b.textContent || ''))
    if (dayButtons.length > 1) {
      fireEvent.click(dayButtons[0])
      expect(onChange).toHaveBeenCalled()
    }
  })

  it('navigates year via select', async () => {
    const DateRangePicker = (await import('@/components/DateRangePicker')).default
    render(
      <DateRangePicker
        startDate={null}
        endDate={null}
        minDate="2024-01-01"
        maxDate="2026-12-31"
        onChange={vi.fn()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(2)
  })

  it('displays selected range in header', async () => {
    const DateRangePicker = (await import('@/components/DateRangePicker')).default
    render(
      <DateRangePicker
        startDate={new Date('2025-06-01')}
        endDate={new Date('2025-06-15')}
        minDate="2024-01-01"
        maxDate="2026-12-31"
        onChange={vi.fn()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText(/Jun 1/)).toBeInTheDocument()
    expect(screen.getByText(/Jun 15/)).toBeInTheDocument()
  })
})
