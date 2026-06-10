import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('API module - basic', () => {
  it('setAuthToken stores token', async () => {
    const { setAuthToken } = await import('@/lib/api')
    setAuthToken('test-token')
    const { getAuthToken } = await import('@/lib/api')
    expect(getAuthToken()).toBe('test-token')
    setAuthToken(null)
    expect(getAuthToken()).toBeNull()
  })

  it('api object has all expected methods', async () => {
    const { api } = await import('@/lib/api')
    expect(api).toBeDefined()
    expect(typeof api.login).toBe('function')
    expect(typeof api.register).toBe('function')
    expect(typeof api.sync).toBe('function')
    expect(typeof api.createTransaction).toBe('function')
    expect(typeof api.createCategory).toBe('function')
    expect(typeof api.createGoal).toBe('function')
    expect(typeof api.createBudget).toBe('function')
  })
})

describe('API module - fetch', () => {
  it('login calls correct endpoint', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'at', refreshToken: 'rt', user: { id: 'u1', name: 'T', email: 't@t.com' } }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.login('test@test.com', 'password')

    expect(result.accessToken).toBe('at')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('login handles error response', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
        statusText: 'Unauthorized',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.login('test@test.com', 'wrong')).rejects.toThrow()
  })

  it('register calls correct endpoint', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'at', refreshToken: 'rt', user: { id: 'u1', name: 'T', email: 't@t.com' } }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.register('Test', 'test@test.com', 'password123')
    expect(result.accessToken).toBe('at')
  })

  it('createTransaction sends correct data', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'tx1' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await api.createTransaction({
      type: 'expense', amount: 50000, categoryId: 'c1', occurredAt: '2026-06-01',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/transactions'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('sync sends changes array', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ serverChanges: [], newSyncTimestamp: '', conflicts: [] }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await api.sync('2026-01-01T00:00:00Z', [])
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/sync'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('includes authorization header when token is set', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ serverChanges: [], newSyncTimestamp: '', conflicts: [] }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { setAuthToken } = await import('@/lib/api')
    setAuthToken('my-jwt-token')

    const { api } = await import('@/lib/api')
    await api.sync('', [])

    const call = mockFetch.mock.calls[0] as unknown as Parameters<typeof fetch>
    const headers = (call[1] as RequestInit)?.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-jwt-token')
  })
})
