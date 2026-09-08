export interface SecurityLogPayload {
  level: 'info' | 'warn' | 'error'
  event: string
  message: string
  context?: Record<string, unknown>
  timestamp?: string
}

export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'authorization']

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export function logSecurityEvent(payload: SecurityLogPayload): SecurityLogPayload {
  const entry: SecurityLogPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
    context: payload.context ? sanitizeLogData(payload.context) : undefined,
  }

  if (process.env.NODE_ENV !== 'test') {
    if (entry.level === 'error') {
      console.error(`[SECURITY_${entry.level.toUpperCase()}] ${entry.event}: ${entry.message}`, entry.context)
    } else if (entry.level === 'warn') {
      console.warn(`[SECURITY_${entry.level.toUpperCase()}] ${entry.event}: ${entry.message}`, entry.context)
    } else {
      console.info(`[SECURITY_${entry.level.toUpperCase()}] ${entry.event}: ${entry.message}`, entry.context)
    }
  }

  return entry
}
