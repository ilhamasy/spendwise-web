export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your profile and preferences.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Profile</h2>
          <p className="mt-1 text-foreground">Profile settings coming soon.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Appearance</h2>
          <p className="mt-1 text-foreground">Theme settings coming soon.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Security</h2>
          <p className="mt-1 text-foreground">Authentication settings coming soon.</p>
        </div>
      </div>
    </div>
  )
}
