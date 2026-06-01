'use client'

const TRANSACTIONS = [
  { date: 'Jun 01, 2026', name: 'Starbucks Coffee', amount: -5.99, category: 'Cafe', logo: '☕' },
  { date: 'May 31, 2026', name: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', logo: '🎬' },
  { date: 'May 30, 2026', name: 'Salary Deposit', amount: 5000, category: 'Income', logo: '💰' },
  { date: 'May 29, 2026', name: 'Uber Ride', amount: -12.5, category: 'Transport', logo: '🚗' },
  { date: 'May 28, 2026', name: 'Apple Store', amount: -999, category: 'Shopping', logo: '🛍' },
]

export default function RecentTransactionsTable() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
        <button className="text-xs font-medium text-primary hover:underline">See all</button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-2 text-left font-medium">Date</th>
              <th className="pb-2 text-left font-medium">Transaction</th>
              <th className="pb-2 text-left font-medium">Category</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-3 text-muted-foreground">{tx.date}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tx.logo}</span>
                    <span className="font-medium text-foreground">{tx.name}</span>
                  </div>
                </td>
                <td className="py-3 text-muted-foreground">{tx.category}</td>
                <td
                  className={`py-3 text-right font-semibold ${
                    tx.amount >= 0 ? 'text-green-600' : 'text-expense'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
