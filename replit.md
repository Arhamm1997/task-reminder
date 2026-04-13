# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### FocusDesk (`artifacts/focus-desk`)
A smart task + sticky notes manager — "second brain" app.
- **Type**: react-vite, served at `/`
- **Storage**: localStorage only (Zustand persist)
- **Features**:
  - Dashboard with stats, today's tasks, recent notes
  - Tasks page: filters (All/Today/Upcoming/Completed/Overdue), drag-to-reorder, search, priority/category/due date, Focus Mode
  - Notes page: masonry grid, 6 color options, pin, inline double-click edit, search
  - Quick capture bar (Ctrl+K) persistent at top
  - Browser Notification API for reminders
  - Auto-archive completed tasks after 7 days
  - Dark/light mode toggle
  - Seed data on first load
- **Dependencies**: zustand, @dnd-kit/core, @dnd-kit/sortable, framer-motion, date-fns, lucide-react
