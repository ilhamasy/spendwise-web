# SpendWise

Personal finance tracker (PWA) built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Type check
npm run typecheck

# Build for production
npm run build
```

## Project Structure

```
src/
  app/              # Next.js App Router pages
    dashboard/      # Dashboard page
    transactions/   # Transactions page
    goals/          # Saving goals page
    settings/       # Settings page
  components/       # Reusable UI components
  lib/              # Utilities, theme, business logic
  hooks/            # Custom React hooks
  types/            # TypeScript type definitions
public/             # Static assets, PWA manifest, icons
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **PWA:** Service worker + web manifest

## Branching Strategy

- `development_master` — main integration branch (default)
- `feat/SW-XXX` — feature branch per story
