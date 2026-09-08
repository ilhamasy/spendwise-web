import { describe, it, expect } from 'vitest'
import { validateSyncPayloadIntegrity } from '@/lib/sync-manager'
import type { SyncQueueItem } from '@/lib/sync-types'

describe('OWASP A08:2021 — Software and Data Integrity Failures', () => {
  it('validates legitimate sync queue item integrity', () => {
    const validItem: Partial<SyncQueueItem> = {
      operation: 'CREATE',
      entityType: 'transaction',
      entityId: 'tx-12345',
      payload: { amount: 50000, type: 'expense' },
    }
    expect(validateSyncPayloadIntegrity(validItem)).toBe(true)
  })

  it('rejects corrupted sync payload items missing operation or entityType', () => {
    const corrupted1: Record<string, unknown> = {
      operation: 'INVALID_OP',
      entityType: 'transaction',
      entityId: 'tx-123',
    }
    expect(validateSyncPayloadIntegrity(corrupted1)).toBe(false)

    const corrupted2: Record<string, unknown> = {
      operation: 'CREATE',
      entityType: 'unsupported_entity',
      entityId: 'tx-123',
    }
    expect(validateSyncPayloadIntegrity(corrupted2)).toBe(false)

    const corrupted3: Record<string, unknown> = {
      operation: 'CREATE',
      entityType: 'transaction',
    }
    expect(validateSyncPayloadIntegrity(corrupted3)).toBe(false)
  })
})
