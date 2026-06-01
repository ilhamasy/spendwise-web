export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Track your financial health at a glance.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="mt-1 text-xl font-bold text-foreground">Rp 0</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="mt-1 text-xl font-bold text-income">Rp 0</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Expense</p>
          <p className="mt-1 text-xl font-bold text-expense">Rp 0</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Savings</p>
          <p className="mt-1 text-xl font-bold text-primary">Rp 0</p>
        </div>
      </div>

      <p className="mt-8 rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
        Charts, recent transactions, and saving goals will appear here.
      </p>
    </div>
  )
}
