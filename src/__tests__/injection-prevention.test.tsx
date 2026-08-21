import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { sanitizeInput } from '@/lib/utils'

describe('OWASP A03:2021 — Injection (XSS & Input Sanitization)', () => {
  it('escapes dangerous HTML tag characters in sanitizeInput', () => {
    const xssScript = "<script>alert('xss')</script>"
    const sanitized = sanitizeInput(xssScript)

    expect(sanitized).not.toContain('<script>')
    expect(sanitized).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;")
  })

  it('escapes image onerror event handlers in sanitizeInput', () => {
    const imgXSS = '<img src="x" onerror="alert(1)">'
    const sanitized = sanitizeInput(imgXSS)

    expect(sanitized).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;')
  })

  it('verifies JSX automatic escaping prevents Stored/Reflected XSS in React rendering', () => {
    const maliciousNote = "<script>window.hacked = true</script>"

    render(
      <div data-testid="tx-note">
        {maliciousNote}
      </div>
    )

    const element = screen.getByTestId('tx-note')
    expect(element.textContent).toBe("<script>window.hacked = true</script>")
    expect(element.children.length).toBe(0)
    // @ts-expect-error global variable check
    expect(window.hacked).toBeUndefined()
  })
})
