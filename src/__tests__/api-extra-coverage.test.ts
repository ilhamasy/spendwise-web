import { describe, it, expect, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// api.logout — line 32
// ---------------------------------------------------------------------------
describe('api.logout', () => {
  it('calls POST /api/v1/auth/logout with credentials and json headers', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Logged out' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.logout()

    expect(result).toEqual({ message: 'Logged out' })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    )
    const callHeaders = mockFetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(callHeaders['Content-Type']).toBe('application/json')
  })

  it('throws on error response', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
        statusText: 'Unauthorized',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.logout()).rejects.toThrow('Unauthorized')
  })
})

// ---------------------------------------------------------------------------
// api.createGoal — line 38
// ---------------------------------------------------------------------------
describe('api.createGoal', () => {
  const goalData = {
    name: 'Buy a car',
    targetAmount: 200000000,
    currentSaved: 50000000,
    targetDate: '2026-12-31',
  }

  it('calls POST /api/v1/goals with correct body', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'goal-1' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.createGoal(goalData)

    expect(result).toEqual({ id: 'goal-1' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/goals',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(goalData),
      })
    )
  })

  it('handles error', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Validation failed' }),
        statusText: 'Bad Request',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.createGoal(goalData)).rejects.toThrow('Validation failed')
  })

  it('works with minimal fields (no optional props)', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'goal-min' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.createGoal({ name: 'Minimal', targetAmount: 10000 })
    expect(result).toEqual({ id: 'goal-min' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/goals',
      expect.objectContaining({
        body: JSON.stringify({ name: 'Minimal', targetAmount: 10000 }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// api.updateGoal — line 41
// ---------------------------------------------------------------------------
describe('api.updateGoal', () => {
  const goalId = 'goal-abc-123'
  const updateData = {
    name: 'Updated goal name',
    targetAmount: 300000000,
    currentSaved: 75000000,
    targetDate: '2027-06-30',
  }

  it('calls PUT /api/v1/goals/:id with correct body', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: goalId }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.updateGoal(goalId, updateData)

    expect(result).toEqual({ id: goalId })
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/v1/goals/${goalId}`,
      expect.objectContaining({
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(updateData),
      })
    )
  })

  it('handles error', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Goal not found' }),
        statusText: 'Not Found',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.updateGoal(goalId, updateData)).rejects.toThrow('Goal not found')
  })

  it('works with partial update (only name)', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: goalId }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.updateGoal(goalId, { name: 'Renamed only' })
    expect(result).toEqual({ id: goalId })
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/v1/goals/${goalId}`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Renamed only' }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// api.createBudget — line 47
// ---------------------------------------------------------------------------
describe('api.createBudget', () => {
  const budgetData = {
    name: 'Monthly groceries',
    amount: 2000000,
    period: 'monthly',
    categoryId: 'cat-food',
  }

  it('calls POST /api/v1/budgets with correct body', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'budget-1' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.createBudget(budgetData)

    expect(result).toEqual({ id: 'budget-1' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/budgets',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(budgetData),
      })
    )
  })

  it('handles error', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Budget already exists' }),
        statusText: 'Conflict',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.createBudget(budgetData)).rejects.toThrow('Budget already exists')
  })
})

// ---------------------------------------------------------------------------
// api.createCategory — line 50
// ---------------------------------------------------------------------------
describe('api.createCategory', () => {
  const categoryData = {
    name: 'Entertainment',
    type: 'expense',
    icon: 'movie',
    color: '#ff5722',
  }

  it('calls POST /api/v1/categories with correct body', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'cat-1' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.createCategory(categoryData)

    expect(result).toEqual({ id: 'cat-1' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/categories',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(categoryData),
      })
    )
  })

  it('handles error', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid type' }),
        statusText: 'Bad Request',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.createCategory(categoryData)).rejects.toThrow('Invalid type')
  })

  it('works with minimal fields (no icon or color)', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'cat-min' }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.createCategory({ name: 'Minimal', type: 'income' })
    expect(result).toEqual({ id: 'cat-min' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/categories',
      expect.objectContaining({
        body: JSON.stringify({ name: 'Minimal', type: 'income' }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// api.sync — line 53
// ---------------------------------------------------------------------------
describe('api.sync', () => {
  const timestamp = '2026-06-29T00:00:00Z'
  const changes = [
    { entityType: 'transaction', entityId: 't1', operation: 'CREATE', payload: {}, timestamp },
  ]

  it('calls POST /api/v1/sync with correct body', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            serverChanges: [],
            newSyncTimestamp: '2026-06-30T00:00:00Z',
            conflicts: [],
          }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.sync(timestamp, changes)

    expect(result).toEqual({
      serverChanges: [],
      newSyncTimestamp: '2026-06-30T00:00:00Z',
      conflicts: [],
    })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/sync',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ lastSyncTimestamp: timestamp, changes }),
      })
    )
  })

  it('handles serverChanges with data', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            serverChanges: [
              {
                entityType: 'transaction',
                entityId: 't-new',
                data: { amount: 50000 },
                timestamp: '2026-06-30T00:00:00Z',
              },
            ],
            newSyncTimestamp: '2026-06-30T00:00:00Z',
            conflicts: [],
          }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.sync(timestamp, changes)

    expect(result.serverChanges).toHaveLength(1)
    expect(result.serverChanges[0].entityId).toBe('t-new')
  })

  it('handles error', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Sync failed' }),
        statusText: 'Internal Server Error',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.sync(timestamp, changes)).rejects.toThrow('Sync failed')
  })

  it('sends empty changes array', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            serverChanges: [],
            newSyncTimestamp: '',
            conflicts: [],
          }),
        statusText: 'OK',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await api.sync(timestamp, [])

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/sync',
      expect.objectContaining({
        body: JSON.stringify({ lastSyncTimestamp: timestamp, changes: [] }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Error handling path coverage — lines 10-13
// ---------------------------------------------------------------------------
describe('request error handling (lines 10-13)', () => {
  it('uses res.statusText when json() rejects (catch path)', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('JSON parse error')),
        statusText: 'Internal Server Error',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.logout()).rejects.toThrow('Internal Server Error')
  })

  it('falls back to HTTP status code when json has no message', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
        json: () => Promise.resolve({}),
        statusText: 'Too Many Requests',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.logout()).rejects.toThrow('HTTP 429')
  })

  it('falls back to HTTP status code when json() rejects and statusText is empty', async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 502,
        json: () => Promise.reject(new Error('boom')),
        statusText: '',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    await expect(api.logout()).rejects.toThrow('HTTP 502')
  })
})

// ---------------------------------------------------------------------------
// 204 No Content response path — line 14
// ---------------------------------------------------------------------------
describe('204 response path (line 14)', () => {
  it('returns empty object when status is 204, without calling json()', async () => {
    const jsonSpy = vi.fn()
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: jsonSpy,
        statusText: 'No Content',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.logout()

    expect(result).toEqual({})
    expect(jsonSpy).not.toHaveBeenCalled()
  })

  it('works with any API method returning 204', async () => {
    const jsonSpy = vi.fn()
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: jsonSpy,
        statusText: 'No Content',
      } as unknown as Response)
    )
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('@/lib/api')
    const result = await api.sync('', [])

    expect(result).toEqual({})
    expect(jsonSpy).not.toHaveBeenCalled()
  })
})
