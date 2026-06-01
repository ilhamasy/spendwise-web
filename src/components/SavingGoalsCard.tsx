'use client'

const GOALS = [
  { title: 'New MacBook Pro', target: 2500, current: 1500, color: '#6e44ff' },
  { title: 'Vacation Fund', target: 3000, current: 1200, color: '#f59e0b' },
  { title: 'Emergency', target: 10000, current: 4500, color: '#22c55e' },
]

export default function SavingGoalsCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Saving Goals</h3>
        <button className="text-xs font-medium text-primary hover:underline">See all</button>
      </div>

      <div className="mt-5 space-y-5">
        {GOALS.map((goal) => {
          const progress = Math.round((goal.current / goal.target) * 100)
          const remaining = goal.target - goal.current
          return (
            <div key={goal.title}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{goal.title}</p>
                <span className="text-xs font-semibold text-foreground">{progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, backgroundColor: goal.color }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                ${remaining.toLocaleString()} left to reach ${goal.target.toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
