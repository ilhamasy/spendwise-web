'use client'

import { useState, useEffect } from 'react'
import { Wallet, ArrowDownToLine, ArrowUpFromLine, PiggyBank } from 'lucide-react'
import KpiCard from '@/components/KpiCard'
import MoneyFlowCard from '@/components/MoneyFlowCard'
import BudgetCard from '@/components/BudgetCard'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SavingGoalsCard from '@/components/SavingGoalsCard'
import { getTotalIncome, getTotalExpense } from '@/lib/transaction-service'
import { getTotalSavings } from '@/lib/goal-service'
import { formatCurrency } from '@/lib/currency'

function computeChange(current: number, previous: number): { change: string; isPositive: boolean } {
  if (previous === 0) return { change: '+0%', isPositive: true }
  const diff = ((current - previous) / Math.abs(previous)) * 100
  const sign = diff >= 0 ? '+' : ''
  return {
    change: `${sign}${diff.toFixed(1)}%`,
    isPositive: diff >= 0,
  }
}

function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]
  return { start, end }
}

export default function DashboardPage() {
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [savings, setSavings] = useState(0)
  const [incomeChange, setIncomeChange] = useState({ change: '+0%', isPositive: true })
  const [expenseChange, setExpenseChange] = useState({ change: '+0%', isPositive: true })
  const [savingsChange, setSavingsChange] = useState({ change: '+0%', isPositive: true })
  const [chartYear, setChartYear] = useState(new Date().getFullYear())

  useEffect(() => {
    async function load() {
      const now = new Date()
      const thisMonth = getMonthDateRange(now.getFullYear(), now.getMonth() + 1)
      const prevMonth = getMonthDateRange(now.getFullYear(), now.getMonth())

      const [totalIncome, totalExpense, currentSavings] = await Promise.all([
        getTotalIncome(),
        getTotalExpense(),
        getTotalSavings(),
      ])

      const [thisMonthIncome, thisMonthExpense] = await Promise.all([
        getTotalIncome(thisMonth.start, thisMonth.end),
        getTotalExpense(thisMonth.start, thisMonth.end),
      ])

      const [prevMonthIncome, prevMonthExpense] = await Promise.all([
        getTotalIncome(prevMonth.start, prevMonth.end),
        getTotalExpense(prevMonth.start, prevMonth.end),
      ])

      setBalance(totalIncome - totalExpense + currentSavings)
      setIncome(thisMonthIncome)
      setExpense(thisMonthExpense)
      setSavings(currentSavings)
      setIncomeChange(computeChange(thisMonthIncome, prevMonthIncome))
      setExpenseChange(computeChange(thisMonthExpense, prevMonthExpense))
      setSavingsChange(computeChange(currentSavings, currentSavings > 0 ? currentSavings * 0.9 : 0))
    }
    load()
  }, [])

  const balanceChange = computeChange(balance, balance)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your finances.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Balance"
          value={formatCurrency(balance)}
          change={balanceChange.change}
          isPositive={balanceChange.isPositive}
          icon={Wallet}
        />
        <KpiCard
          title="Total Income"
          value={formatCurrency(income)}
          change={incomeChange.change}
          isPositive={incomeChange.isPositive}
          icon={ArrowDownToLine}
        />
        <KpiCard
          title="Total Expense"
          value={formatCurrency(expense)}
          change={expenseChange.change}
          isPositive={!expenseChange.isPositive}
          icon={ArrowUpFromLine}
        />
        <KpiCard
          title="Total Savings"
          value={formatCurrency(savings)}
          change={savingsChange.change}
          isPositive={savingsChange.isPositive}
          icon={PiggyBank}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoneyFlowCard year={chartYear} onYearChange={setChartYear} />
        </div>
        <BudgetCard year={chartYear} />
      </div>

      {/* Bottom: Transactions + Goals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactionsTable />
        </div>
        <SavingGoalsCard />
      </div>
    </div>
  )
}
