'use client'

import { useState, useEffect, useCallback } from 'react'
import walletIcon from '@/assets/icons8-wallet-94.png'
import salaryIcon from '@/assets/icons8-salary-94.png'
import cartIcon from '@/assets/icons8-shopping-cart-94.png'
import bankIcon from '@/assets/icons8-bank-94.png'
import KpiCard from '@/components/KpiCard'
import MoneyFlowCard from '@/components/MoneyFlowCard'
import BudgetCard from '@/components/BudgetCard'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SavingGoalsCard from '@/components/SavingGoalsCard'
import DateFilter, { getFilterDateRange, getChartYear } from '@/components/DateFilter'
import type { FilterPeriod } from '@/components/DateFilter'
import { getTotalIncome, getTotalExpense } from '@/lib/transaction-service'
import { getTotalSavings } from '@/lib/goal-service'
import { formatCurrency } from '@/lib/currency'
import { db } from '@/lib/db'

function computeChange(current: number, previous: number): { change: string; isPositive: boolean } {
  if (previous === 0) return { change: '+0%', isPositive: true }
  const diff = ((current - previous) / Math.abs(previous)) * 100
  const sign = diff >= 0 ? '+' : ''
  return { change: `${sign}${diff.toFixed(1)}%`, isPositive: diff >= 0 }
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<FilterPeriod>('year')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [minDate, setMinDate] = useState('2024-01-01')
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [savings, setSavings] = useState(0)
  const [incomeChange, setIncomeChange] = useState({ change: '+0%', isPositive: true })
  const [expenseChange, setExpenseChange] = useState({ change: '+0%', isPositive: true })
  const [savingsChange, setSavingsChange] = useState({ change: '+0%', isPositive: true })
  const [chartYear, setChartYear] = useState(new Date().getFullYear())

  useEffect(() => {
    db.transactions.orderBy('occurredAt').first().then((first) => {
      if (first) setMinDate(first.occurredAt)
    })
  }, [])

  const fetchData = useCallback(async () => {
    const { start, end } = getFilterDateRange(period, customStart, customEnd)

    const [totalIncome, totalExpense, currentSavings] = await Promise.all([
      getTotalIncome(start, end),
      getTotalExpense(start, end),
      getTotalSavings(),
    ])

    const rangeDays = (new Date(end).getTime() - new Date(start).getTime()) / 86400000
    const prevStart = new Date(new Date(start).getTime() - (rangeDays + 1) * 86400000).toISOString().split('T')[0]
    const prevEnd = new Date(new Date(start).getTime() - 86400000).toISOString().split('T')[0]

    const [prevIncome, prevExpense] = await Promise.all([
      getTotalIncome(prevStart, prevEnd),
      getTotalExpense(prevStart, prevEnd),
    ])

    setBalance(totalIncome - totalExpense + currentSavings)
    setIncome(totalIncome)
    setExpense(totalExpense)
    setSavings(currentSavings)
    setIncomeChange(computeChange(totalIncome, prevIncome))
    setExpenseChange(computeChange(totalExpense, prevExpense))
    setSavingsChange(computeChange(currentSavings, currentSavings > 0 ? currentSavings * 0.9 : 0))
    setChartYear(getChartYear(period, customStart, customEnd))
  }, [period, customStart, customEnd])

   
  useEffect(() => {
    fetchData()
  }, [fetchData])

   
  useEffect(() => {
    const handler = () => fetchData()
    window.addEventListener('transaction-updated', handler)
    return () => window.removeEventListener('transaction-updated', handler)
  }, [fetchData])

  const balanceChange = computeChange(balance, balance)

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
        <BudgetCard year={chartYear} period={period} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactionsTable />
        </div>
        <SavingGoalsCard />
      </div>
    </div>
  )
}
