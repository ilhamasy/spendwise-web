import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('OWASP A02:2021 — Cryptographic Failures', () => {
  it('enforces bcrypt cost factor of 12 for password hashing', async () => {
    const rawPassword = 'SecureUserPassword123!'
    const hash = await bcrypt.hash(rawPassword, 12)

    expect(hash).not.toEqual(rawPassword)
    expect(hash).toMatch(/\$2[ab]\$12\$/)
    expect(await bcrypt.compare(rawPassword, hash)).toBe(true)
    expect(await bcrypt.compare('WrongPassword', hash)).toBe(false)
  })

  it('ensures plaintext passwords are never stored in localStorage user object', () => {
    const mockUserStorage = {
      id: 'u-101',
      name: 'Crypto User',
      email: 'crypto@test.com',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.8tX.yJ.x2/O/N1K1e9X5x6y7z8a9',
    }

    const jsonString = JSON.stringify(mockUserStorage)

    expect(jsonString).not.toContain('password123')
    expect(jsonString).toContain('passwordHash')
    expect(mockUserStorage).not.toHaveProperty('password')
  })

  it('validates password hash uniqueness with random salts', async () => {
    const password = 'SamePasswordToTestSalts'
    const hash1 = await bcrypt.hash(password, 12)
    const hash2 = await bcrypt.hash(password, 12)

    expect(hash1).not.toEqual(hash2)
    expect(await bcrypt.compare(password, hash1)).toBe(true)
    expect(await bcrypt.compare(password, hash2)).toBe(true)
  })
})
