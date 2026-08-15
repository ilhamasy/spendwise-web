import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ConnectivityStatus from '@/components/ConnectivityStatus'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

describe('ConnectivityStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders Online badge when online', () => {
    render(<ConnectivityStatus />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders Offline badge when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    render(<ConnectivityStatus />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('triggers offline popup warning when transitioning online -> offline', () => {
    render(<ConnectivityStatus />)
    expect(screen.queryByText(/Koneksi Terputus/)).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByText(/Koneksi Terputus/)).toBeInTheDocument()
    expect(
      screen.getByText(/Kamu sedang Offline, tapi tetap tenang/)
    ).toBeInTheDocument()
  })

  it('closes offline warning modal when Ok button clicked', () => {
    render(<ConnectivityStatus />)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    const okButton = screen.getByRole('button', { name: 'Ok' })
    fireEvent.click(okButton)

    expect(screen.queryByText(/Koneksi Terputus/)).not.toBeInTheDocument()
  })

  it('auto-expires offline modal after 30 seconds', () => {
    render(<ConnectivityStatus />)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(screen.getByText(/Koneksi Terputus/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(31000)
    })

    expect(screen.queryByText(/Koneksi Terputus/)).not.toBeInTheDocument()
  })
})
