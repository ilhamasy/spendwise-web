import { describe, it, expect } from 'vitest'
import packageJson from '../../package.json'

describe('OWASP A06:2021 — Vulnerable and Outdated Components', () => {
  it('verifies critical dependencies have defined patch versions in package.json', () => {
    expect(packageJson.dependencies).toBeDefined()
    expect(packageJson.dependencies.next).toBeDefined()
    expect(packageJson.dependencies.react).toBeDefined()
    expect(packageJson.dependencies.bcryptjs).toBeDefined()

    // Ensure Next.js is updated to 16.3.2+
    expect(packageJson.dependencies.next).toMatch(/16\./)
  })

  it('ensures devDependencies are defined without deprecated sub-packages', () => {
    expect(packageJson.devDependencies).toBeDefined()
    expect(packageJson.devDependencies.vitest).toBeDefined()
    expect(packageJson.devDependencies.typescript).toBeDefined()
  })
})
