export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Saving Goals</h1>
      <p className="mt-2 text-muted-foreground">
        Set and track your saving goals.
      </p>

      <div className="mt-8 rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">
        No saving goals yet. Create your first goal to start saving.
      </div>
    </div>
  )
}
