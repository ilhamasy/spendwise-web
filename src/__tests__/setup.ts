import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// vitest globals declaration for TypeScript
declare global {
  const vi: typeof import('vitest')['vi']
}

// Mock localStorage for jsdom
const store: Record<string, string> = {}
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k])
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  },
  writable: true,
})
