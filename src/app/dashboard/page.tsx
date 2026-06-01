'use client'

import { Wallet, ArrowDownToLine, ArrowUpFromLine, PiggyBank } from 'lucide-react'
import KpiCard from '@/components/KpiCard'
import MoneyFlowCard from '@/components/MoneyFlowCard'
import BudgetCard from '@/components/BudgetCard'
import RecentTransactionsTable from '@/components/RecentTransactionsTable'
import SavingGoalsCard from '@/components/SavingGoalsCard'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Adaline!</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your finances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors">
            Manage widgets
          </button>
          <button className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90 transition-colors">
            + Add new widget
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Balance"
          value="$15,700.00"
          change="+12.1%"
          isPositive
          icon={Wallet}
        />
        <KpiCard
          title="Total Income"
          value="$8,500.00"
          change="+6.3%"
          isPositive
          icon={ArrowDownToLine}
        />
        <KpiCard
          title="Total Expense"
          value="$6,222.00"
          change="-2.4%"
          isPositive={false}
          icon={ArrowUpFromLine}
        />
        <KpiCard
          title="Total Savings"
          value="$32,913.00"
          change="+12.1%"
          isPositive
          icon={PiggyBank}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MoneyFlowCard />
        </div>
        <BudgetCard />
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
