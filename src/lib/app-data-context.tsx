'use client'

/**
 * AppDataContext — Global in-memory data store for SpendWise.
 *
 * Strategy:
 *   - Load all data from IndexedDB ONCE when the user first enters the app (after DataLoader finishes).
 *   - All pages subscribe to this context and get data instantly — no per-page fetch needed.
 *   - On `transaction-updated` (sync event) or explicit `refresh()`, we re-fetch from IndexedDB.
 *   - Mutations (create/update/delete) call the service, then call `refresh()` so the UI stays current.
 *
 * Cons (acceptable trade-offs for this app):
 *   - RAM: all records are kept in memory. Fine for personal finance data volumes.
 *   - Cross-tab staleness: data in another tab is only reflected after the sync tick (~30s).
 *     This is identical to the existing behavior before this context was added.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { db } from './db'
import type { Transaction, Category, SavingGoal, GoalContribution, Budget } from '@/types'

interface AppData {
  transactions: Transaction[]
  categories: Category[]
  goals: SavingGoal[]
  contributions: GoalContribution[]
  budgets: Budget[]
  isLoaded: boolean
  /** Call this after any mutation to re-sync in-memory state from IndexedDB */
  refresh: () => Promise<void>
}

const AppDataContext = createContext<AppData>({
  transactions: [],
  categories: [],
  goals: [],
  contributions: [],
  budgets: [],
  isLoaded: false,
  refresh: async () => {},
})

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [contributions, setContributions] = useState<GoalContribution[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const refreshingRef = useRef(false)

  const refresh = useCallback(async () => {
    // Debounce: avoid parallel re-fetches triggered by rapid events
    if (refreshingRef.current) return
    refreshingRef.current = true
    try {
      const [txns, cats, gs, contribs, bgs] = await Promise.all([
        db.transactions.orderBy('occurredAt').reverse().toArray(),
        db.categories.toArray(),
        db.savingGoals.orderBy('createdAt').reverse().toArray(),
        db.goalContributions.toArray(),
        db.budgets.toArray(),
      ])
      setTransactions(txns)
      setCategories(cats)
      setGoals(gs)
      setContributions(contribs)
      setBudgets(bgs)
      setIsLoaded(true)
    } finally {
      refreshingRef.current = false
    }
  }, [])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Re-fetch whenever the sync manager pulls new data from the server
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('transaction-updated', handler)
    window.addEventListener('spendwise-data-updated', handler)
    return () => {
      window.removeEventListener('transaction-updated', handler)
      window.removeEventListener('spendwise-data-updated', handler)
    }
  }, [refresh])

  return (
    <AppDataContext.Provider
      value={{ transactions, categories, goals, contributions, budgets, isLoaded, refresh }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  return useContext(AppDataContext)
}
