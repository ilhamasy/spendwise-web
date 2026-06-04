const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return {} as T
  return res.json()
}

export const api = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (name: string, email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: { id: string; name: string; email: string } }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    ),

  sync: (lastSyncTimestamp: string, changes: unknown[]) =>
    request<import('@/lib/sync-types').DataSyncResponse>('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ lastSyncTimestamp, changes }),
    }),
}
