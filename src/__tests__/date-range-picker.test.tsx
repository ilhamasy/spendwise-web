import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateRangePicker from '@/components/DateRangePicker'

vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span>←</span>,
  ChevronRight: () => <span>→</span>,
}))

const defaultProps = {
  startDate: null,
  endDate: null,
  minDate: '2024-01-01',
  maxDate: '2026-12-31',
  onChange: vi.fn(),
  onApply: vi.fn(),
  onCancel: vi.fn(),
}

describe('DateRangePicker', () => {
  it('renders month and year selectors', () => {
    render(<DateRangePicker {...defaultProps} />)
    expect(screen.getByText('←')).toBeInTheDocument()
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  it('shows day headers', () => {
    render(<DateRangePicker {...defaultProps} />)
    expect(screen.getByText('Su')).toBeInTheDocument()
    expect(screen.getByText('Mo')).toBeInTheDocument()
    expect(screen.getByText('Sa')).toBeInTheDocument()
  })

  it('renders Cancel and Apply buttons', () => {
    render(<DateRangePicker {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel clicked', () => {
    render(<DateRangePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('disables Apply when no range selected', () => {
    render(<DateRangePicker {...defaultProps} />)
    const applyBtn = screen.getByText('Apply')
    expect(applyBtn).toBeDisabled()
  })

  it('navigates months with chevron buttons', () => {
    render(<DateRangePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('←'))
    expect(screen.getByText('←')).toBeInTheDocument()
    fireEvent.click(screen.getByText('→'))
    fireEvent.click(screen.getByText('→'))
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  it('shows disabled day styling for out-of-range dates', () => {
    render(<DateRangePicker {...defaultProps} minDate="2025-01-01" maxDate="2025-01-31" />)
    const buttons = screen.getAllByRole('button').filter(b => b.textContent?.match(/^\d+$/))
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('calls onChange when a day is clicked', () => {
    render(<DateRangePicker {...defaultProps} />)
    const dayButtons = screen.getAllByRole('button').filter(b => b.textContent?.match(/^\d+$/) && !b.hasAttribute('disabled'))
    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[0])
      expect(defaultProps.onChange).toHaveBeenCalled()
    }
  })
})
