import { describe, it, expect } from 'vitest'
import { isSafeApiEndpoint } from '@/lib/api'

describe('OWASP A10:2021 — Server-Side Request Forgery (SSRF)', () => {
  it('allows safe relative API endpoints', () => {
    expect(isSafeApiEndpoint('/api/v1/auth/login')).toBe(true)
    expect(isSafeApiEndpoint('/api/v1/transactions')).toBe(true)
    expect(isSafeApiEndpoint('./local-route')).toBe(true)
  })

  it('rejects untrusted external URLs and malicious IP targets', () => {
    expect(isSafeApiEndpoint('http://169.254.169.254/latest/meta-data')).toBe(false)
    expect(isSafeApiEndpoint('http://127.0.0.1:8080/internal')).toBe(false)
    expect(isSafeApiEndpoint('http://malicious-external-domain.com/steal')).toBe(false)
    expect(isSafeApiEndpoint('')).toBe(false)
  })
})
