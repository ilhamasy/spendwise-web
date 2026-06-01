export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <p className="mt-2 text-muted-foreground">
        View and manage all your transactions.
      </p>

      <div className="mt-8 rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">
        No transactions yet. Tap the + button to add your first transaction.
      </div>
    </div>
  )
}
