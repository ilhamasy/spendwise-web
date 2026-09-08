import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { LoadingProvider, useLoading } from '@/components/LoadingProvider'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

function TestChild() {
  const { showLoading, hideLoading } = useLoading()
  return (
    <div>
      <button onClick={showLoading}>Show</button>
      <button onClick={hideLoading}>Hide</button>
    </div>
  )
}

describe('LoadingProvider', () => {
  it('renders children', () => {
    const { container } = render(
      <LoadingProvider>
        <div>Hello</div>
      </LoadingProvider>
    )
    expect(container.textContent).toContain('Hello')
  })

  it('provides showLoading and hideLoading', () => {
    render(
      <LoadingProvider>
        <TestChild />
      </LoadingProvider>
    )
    expect(screen.getByText('Show')).toBeInTheDocument()
    expect(screen.getByText('Hide')).toBeInTheDocument()
  })
})
