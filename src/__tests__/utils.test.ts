import { describe, it, expect } from 'vitest'
import { cn, generateId } from '@/lib/utils'

describe('cn', () => {
  it('joins multiple string classes', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters falsy values', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })

  it('preserves boolean true values if passed as class', () => {
    expect(cn('a', true && 'b', false && 'c')).toBe('a b')
  })
})

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('matches UUID format', () => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(generateId()).toMatch(regex)
  })
})
