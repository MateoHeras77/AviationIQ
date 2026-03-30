# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AviationIQ is a cloud-based SaaS platform for digitizing ground handling operations at regional airlines in Canada and the US. It replaces paper checklists, Excel, and WhatsApp with a unified real-time operations system. See `docs/PRD-General.md` for full product requirements.

## Tech Stack

- **Frontend:** Next.js 14 App Router, TypeScript (strict mode)
- **UI:** Tailwind CSS, shadcn/ui
- **State:** React Query (TanStack Query v5) for server state sync and caching
- **Forms:** React Hook Form + Zod for validation
- **Backend:** Supabase (PostgreSQL 15+, Auth, Storage, Realtime, Edge Functions)
- **Email:** Nodemailer with Gmail SMTP via Google App Password
- **Deploy:** Vercel

## Architecture

- **Multi-tenant:** Single PostgreSQL schema with `organization_id` on every table. Row Level Security (RLS) enforced at the database level for tenant isolation. No exceptions.
- **Auth:** Supabase Auth with 5 roles: `admin`, `station_manager`, `supervisor`, `agent`, `airline_client` (read-only). Custom JWT claims for `user_role` and `organization_id`.
- **Realtime:** Flight Board uses Supabase Realtime for live updates.
- **Server Actions:** Used for all mutations (Next.js App Router pattern). Defined in `actions.ts` per route.
- **Edge Functions:** Supabase Edge Functions (Deno/TypeScript) for SLA calculation, PDF generation, email triggers.

## Folder Structure

```
/app
  /(auth)              Login, register
  /(dashboard)         All operational modules
    /turnaround        Flight Board, Tracker, Event Log, Alerts
    /grooming          Work Orders, Assignment, Performance
    /damage            New Incident, Approval Workflow, History
    /baggage           New Case, Tracker, Delivery Log
    /workforce         Shifts, Assignment, Attendance, Handover
    /portal            Airline Client read-only views
    /analytics         Dashboard, Reports, Export Center
    /settings          Org, Users, Aircraft, SLA, Notifications
/components
  /ui                  shadcn base components
  /modules             Feature-specific components by module
    /shared            Reusable cross-module components
/lib
  /supabase            Client, server, middleware, admin helpers
  /email               Nodemailer config and templates
  /validations         Zod schemas per module
/supabase
  /migrations          SQL migration files (YYYYMMDDHHMMSS_name.sql)
  /functions           Edge Functions
  /seed                Test data
```

## Agent Team Domain Ownership

Three specialized agents with strict domain boundaries. See `.claude/agents/` for full definitions.

| Agent | Owns | Never Touches |
|---|---|---|
| Database | `/supabase/**` | `/app`, `/components`, `/lib/email`, `/middleware.ts` |
| Frontend | `/app/**`, `/components/**`, `/lib/validations/**` | `/supabase`, `/lib/supabase`, `/lib/email`, `/middleware.ts` |
| Integration | `/lib/supabase/**`, `/lib/email/**`, `/middleware.ts`, `.env.*`, `vercel.json` | `/app`, `/components`, `/supabase/migrations` |

## Common Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run Supabase locally
npx supabase start
npx supabase db reset          # Reset local DB and re-run all migrations

# Create a new migration
npx supabase migration new <name>

# Generate TypeScript types from DB schema
npx supabase gen types typescript --local > lib/supabase/types.ts

# Serve Edge Functions locally
npx supabase functions serve

# Lint and type check
npm run lint
npx tsc --noEmit

# Build for production
npm run build
```

## Coding Conventions

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Type definition files: `<module-name>.types.ts` per module directory

### File Naming
- Files: `kebab-case` (e.g., `flight-board.tsx`, `send-email.ts`)
- Components: `PascalCase` exports (e.g., `FlightBoard`, `TurnaroundTracker`)
- Server Actions: prefixed with `action` (e.g., `actionCreateFlight`, `actionLogEvent`)

### Database
- Table names: `snake_case`, plural (e.g., `flights`, `turnaround_events`)
- Column names: `snake_case` (e.g., `organization_id`, `created_at`)
- All tables include: `id UUID PRIMARY KEY`, `organization_id UUID NOT NULL`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`
- Use `TIMESTAMPTZ` for all datetime columns
- Use PostgreSQL enums for fixed value sets
- RLS policies on every table — tenant isolation + role-based access

### Frontend
- Server Components by default. `"use client"` only when interactivity is required.
- Mobile-first responsive design — ramp supervisors use phones outdoors.
- React Hook Form + Zod for all forms. No unvalidated user input.
- React Query for client-side data fetching. Server Components for initial loads.

## Key Domain Rules

- Turnaround event sequence (fixed order): aircraft_arrival → door_open → deplaning_start → deplaning_end → cleaning_start → cleaning_end → catering_confirmed → fueling_confirmed → boarding_start → boarding_end → door_close → pushback
- Damage report approval chain: agent → supervisor → station_manager. No airline notification until final approval.
- Grooming cleaning levels: transit_clean, full_clean, deep_clean
- Baggage case pipeline: reported → located → in_transit → out_for_delivery → delivered → closed
- Flight status colors: on_track=green, at_risk=yellow, delayed=red, completed=gray
- Gmail SMTP daily limits: 500 (standard Gmail), 2,000 (Google Workspace)

## MVP Modules (Phase 1)

Turnaround Operations, Grooming Management, Damage Reports, and Settings/Administration.

Phase 2: Baggage Services, Workforce Management.
Phase 3: Airline Client Portal, Analytics and Reporting.

## Available Skills

- `supabase-postgres-best-practices` — Reference when writing SQL, designing schemas, or optimizing queries. See `.agents/skills/supabase-postgres-best-practices/`
- `web-design-guidelines` — Reference when building or reviewing UI components. See `.agents/skills/web-design-guidelines/`
