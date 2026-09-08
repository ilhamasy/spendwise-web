'use client'

import { useState, useMemo } from 'react'
import walletIcon from '@/assets/icons8-wallet-94.png'
import salaryIcon from '@/assets/icons8-salary-94.png'
import cartIcon from '@/assets/icons8-shopping-cart-94.png'
import bankIcon from '@/assets/icons8-bank-94.png'
import KpiCard from '@/components/KpiCard'
import MoneyFlowCard from '@/components/MoneyFlowCard'
import BudgetCard from '@/components/BudgetCard'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SavingGoalsCard from '@/components/SavingGoalsCard'
import { BudgetSummaryCard } from '@/components/BudgetSummaryCard'
import DateFilter, { getFilterDateRange, getChartYear } from '@/components/DateFilter'
import type { FilterPeriod } from '@/components/DateFilter'
import { formatCurrency } from '@/lib/currency'
import { useAppData } from '@/lib/app-data-context'

function computeChange(current: number, previous: number): { change: string; isPositive: boolean } {
  if (previous === 0) return { change: '+0%', isPositive: true }
  const diff = ((current - previous) / Math.abs(previous)) * 100
  const sign = diff >= 0 ? '+' : ''
  return { change: `${sign}${diff.toFixed(1)}%`, isPositive: diff >= 0 }
}

export default function DashboardPage() {
  const { transactions, goals } = useAppData()
  const [period, setPeriod] = useState<FilterPeriod>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // All computations are synchronous from in-memory data — no loading needed
  const { start, end } = useMemo(
    () => getFilterDateRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  )

  const chartYear = useMemo(
    () => getChartYear(period, customStart, customEnd),
    [period, customStart, customEnd],
  )

  const minDate = useMemo(
    () =>
      transactions.length > 0
        ? [...transactions].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))[0].occurredAt
        : '2024-01-01',
    [transactions],
  )

  const income = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income' && t.occurredAt >= start && t.occurredAt <= end)
        .reduce((s, t) => s + t.amount, 0),
    [transactions, start, end],
  )

  const expense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense' && t.occurredAt >= start && t.occurredAt <= end)
        .reduce((s, t) => s + t.amount, 0),
    [transactions, start, end],
  )

  const savings = useMemo(
    () =>
      goals
        .filter((g) => g.status === 'active')
        .reduce((s, g) => s + g.currentSaved, 0),
    [goals],
  )

  const balance = income - expense + savings

  // Previous period for percentage change
  const rangeDays = (new Date(end).getTime() - new Date(start).getTime()) / 86400000
  const prevStart = new Date(new Date(start).getTime() - (rangeDays + 1) * 86400000)
    .toISOString()
    .split('T')[0]
  const prevEnd = new Date(new Date(start).getTime() - 86400000).toISOString().split('T')[0]

  const prevIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income' && t.occurredAt >= prevStart && t.occurredAt <= prevEnd)
        .reduce((s, t) => s + t.amount, 0),
    [transactions, prevStart, prevEnd],
  )

  const prevExpense = useMemo(
    () =>
      transactions
        .filter(
          (t) => t.type === 'expense' && t.occurredAt >= prevStart && t.occurredAt <= prevEnd,
        )
        .reduce((s, t) => s + t.amount, 0),
    [transactions, prevStart, prevEnd],
  )

  const balanceChange = computeChange(balance, balance)
  const incomeChange = computeChange(income, prevIncome)
  const expenseChange = computeChange(expense, prevExpense)
  const savingsChange = computeChange(savings, savings > 0 ? savings * 0.9 : 0)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your finances.
        </p>
        <div className="mt-3">
          <DateFilter
            period={period}
            customStart={customStart}
            customEnd={customEnd}
            minDate={minDate}
            onPeriodChange={setPeriod}
            onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e) }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Balance" value={formatCurrency(balance)} change={balanceChange.change} isPositive={balanceChange.isPositive} icon={walletIcon} />
        <KpiCard title="Total Income" value={formatCurrency(income)} change={incomeChange.change} isPositive={incomeChange.isPositive} icon={salaryIcon} />
        <KpiCard title="Total Expense" value={formatCurrency(expense)} change={expenseChange.change} isPositive={!expenseChange.isPositive} icon={cartIcon} />
        <KpiCard title="Total Savings" value={formatCurrency(savings)} change={savingsChange.change} isPositive={savingsChange.isPositive} icon={bankIcon} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoneyFlowCard year={chartYear} />
        </div>
        <BudgetCard year={chartYear} period={period} customStart={customStart} customEnd={customEnd} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentTransactionsTable />
        <BudgetSummaryCard />
        <SavingGoalsCard />
      </div>
    </div>
  )
}
