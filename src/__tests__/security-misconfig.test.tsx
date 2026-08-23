import { describe, it, expect } from 'vitest'
import nextConfig from '../../next.config'

describe('OWASP A05:2021 — Security Misconfiguration (Next.js Headers)', () => {
  it('defines HTTP security headers in Next.js configuration', async () => {
    if (typeof nextConfig.headers === 'function') {
      const headersConfig = await nextConfig.headers()
      expect(headersConfig.length).toBeGreaterThan(0)

      const globalHeaders = headersConfig.find(h => h.source === '/:path*')
      expect(globalHeaders).toBeDefined()

      const headerKeys = globalHeaders?.headers.map(h => h.key)
      expect(headerKeys).toContain('X-Content-Type-Options')
      expect(headerKeys).toContain('X-Frame-Options')
      expect(headerKeys).toContain('X-XSS-Protection')
      expect(headerKeys).toContain('Referrer-Policy')
    }
  })
})
