export function isSafeApiEndpoint(endpoint: string): boolean {
  if (!endpoint) return false
  if (endpoint.startsWith('/') || endpoint.startsWith('./')) return true
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (baseUrl && endpoint.startsWith(baseUrl)) return true
  return false
}

async function request<T>(endpoint: string, options: (RequestInit & { silent?: boolean }) = {}): Promise<T> {
  if (!isSafeApiEndpoint(endpoint)) {
    throw new Error('SSRF Protection: Invalid or untrusted API endpoint')
  }

  const { silent, ...fetchOptions } = options
  const showOverlay = !silent && typeof window !== 'undefined'
  if (showOverlay) {
    window.dispatchEvent(new CustomEvent('spendwise-loading-start'))
  }
  try {
    const res = await fetch(endpoint, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || `HTTP ${res.status}`)
    }
    if (res.status === 204) return {} as T
    return res.json()
  } finally {
    if (showOverlay) {
      window.dispatchEvent(new CustomEvent('spendwise-loading-end'))
    }
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (name: string, email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }>(
      '/api/v1/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    ),

  logout: () =>
    request<{ message: string }>('/api/v1/auth/logout', { method: 'POST', silent: true }),

  createTransaction: (data: { type: string; amount: number; categoryId: string; occurredAt: string; note?: string }) =>
    request<{ id: string }>('/api/v1/transactions', { method: 'POST', body: JSON.stringify(data) }),

  createGoal: (data: { name: string; targetAmount: number; currentSaved?: number; targetDate?: string }) =>
    request<{ id: string }>('/api/v1/goals', { method: 'POST', body: JSON.stringify(data) }),

  updateGoal: (id: string, data: { name?: string; targetAmount?: number; currentSaved?: number; targetDate?: string }) =>
    request<{ id: string }>('/api/v1/goals/' + id, { method: 'PUT', body: JSON.stringify(data) }),

  addContribution: (goalId: string, data: { amount: number; note?: string; date?: string }) =>
    request<{ contribution: unknown; goal: unknown }>('/api/v1/goals/' + goalId + '/contributions', { method: 'POST', body: JSON.stringify(data) }),

  createBudget: (data: { name: string; amount: number; period: string; categoryId: string }) =>
    request<{ id: string }>('/api/v1/budgets', { method: 'POST', body: JSON.stringify(data) }),

  createCategory: (data: { name: string; type: string; icon?: string; color?: string }) =>
    request<{ id: string }>('/api/v1/categories', { method: 'POST', body: JSON.stringify(data) }),

  sync: (lastSyncTimestamp: string, changes: unknown[], silent: boolean = true) =>
    request<import('@/lib/sync-types').DataSyncResponse>('/api/v1/sync', {
      method: 'POST',
      body: JSON.stringify({ lastSyncTimestamp, changes }),
      silent,
    }),
}
