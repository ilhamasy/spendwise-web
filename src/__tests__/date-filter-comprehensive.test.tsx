import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateFilter, { getFilterDateRange, getChartYear } from '@/components/DateFilter'

vi.mock('lucide-react', () => ({
  Calendar: () => <span>📅</span>,
  X: () => <span>✕</span>,
}))

vi.mock('@/components/DateRangePicker', () => ({
  default: ({ onApply, onCancel }: { onApply: (s: Date, e: Date) => void; onCancel: () => void }) => (
    <div data-testid="picker">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => onApply(new Date('2025-06-01'), new Date('2025-06-15'))}>Apply</button>
    </div>
  ),
}))

const defaultProps = {
  period: 'week' as const,
  customStart: '',
  customEnd: '',
  minDate: '2024-01-01',
  onPeriodChange: vi.fn(),
  onCustomChange: vi.fn(),
}

describe('DateFilter', () => {
  it('renders period buttons', () => {
    render(<DateFilter {...defaultProps} />)
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('This Year')).toBeInTheDocument()
  })

  it('calls onPeriodChange when period clicked', () => {
    render(<DateFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('This Month'))
    expect(defaultProps.onPeriodChange).toHaveBeenCalledWith('month')
  })

  it('opens date picker when calendar clicked', () => {
    render(<DateFilter {...defaultProps} />)
    expect(screen.queryByTestId('picker')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('📅'))
    expect(screen.getByTestId('picker')).toBeInTheDocument()
  })

  it('closes picker on Cancel', () => {
    render(<DateFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('📅'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByTestId('picker')).not.toBeInTheDocument()
  })

  it('applies custom range', () => {
    render(<DateFilter {...defaultProps} />)
    fireEvent.click(screen.getByText('📅'))
    fireEvent.click(screen.getByText('Apply'))
    expect(defaultProps.onPeriodChange).toHaveBeenCalledWith('custom')
    expect(defaultProps.onCustomChange).toHaveBeenCalledWith('2025-06-01', '2025-06-15')
  })

  it('shows custom range label when period is custom', () => {
    render(
      <DateFilter
        {...defaultProps}
        period="custom"
        customStart="2025-03-01"
        customEnd="2025-03-15"
      />
    )
    expect(screen.getByText(/Mar 1, 2025/)).toBeInTheDocument()
    expect(screen.getByText('✕')).toBeInTheDocument()
  })
})

describe('getFilterDateRange', () => {
  it('returns custom range for custom period', () => {
    const result = getFilterDateRange('custom', '2025-01-01', '2025-01-31')
    expect(result.start).toBe('2025-01-01')
    expect(result.end).toBe('2025-01-31')
  })

  it('returns week range', () => {
    const result = getFilterDateRange('week', '', '')
    expect(result.start).toBeTruthy()
    expect(result.end).toBeTruthy()
  })

  it('returns month range', () => {
    const result = getFilterDateRange('month', '', '')
    expect(result.start).toContain('-01')
    expect(result.end).toBeTruthy()
  })

  it('returns year range', () => {
    const result = getFilterDateRange('year', '', '')
    expect(result.start).toContain('-01-01')
    expect(result.end).toBeTruthy()
  })
})

describe('getChartYear', () => {
  it('returns current year for non-custom period', () => {
    const result = getChartYear('week', '', '')
    expect(result).toBe(new Date().getFullYear())
  })

  it('returns custom start year when same year', () => {
    const result = getChartYear('custom', '2025-03-01', '2025-09-01')
    expect(result).toBe(2025)
  })

  it('returns dominant year when spanning years', () => {
    const result = getChartYear('custom', '2025-11-01', '2026-02-01')
    expect(result).toBe(2025)
  })
})
