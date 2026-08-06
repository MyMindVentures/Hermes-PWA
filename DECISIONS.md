# Decisions

## ADR-001 — Refine foundation
- **Decision:** Bootstrap from Refine's `examples/with-nextjs-next-auth` at commit `0d6d062e73189aa196a5ffbd9a8939134f88bd2d`.
- **Reason:** The user explicitly requires Refine, Next.js, TypeScript, routing, authentication patterns and CRUD foundation.
- **Alternatives rejected:** Empty Vite codebase, generic Next starter.
- **Evidence:** Refine repository cloned and inspected; official Refine documentation consulted.

## ADR-002 — Existing Hermes AI Supabase backend
- **Decision:** Use the existing Supabase project `kjjiufximimaxbeiqmce` as the single authentication, database, RLS, Realtime, Storage and Edge Function backend.
- **Reason:** User explicitly requires the PWA to be a module of the Hermes AI ecosystem. The project is `ACTIVE_HEALTHY` in `eu-west-3`.
- **Alternatives rejected:** New Supabase project, separate database, duplicate user/project registry.
- **Evidence:** Supabase project lookup and schema inspection. Existing `project_management` schema contains the canonical Hermes project registry.

## ADR-003 — Shared project identity
- **Decision:** Reference `project_management.projects` from the PWA instead of creating another Projects table.
- **Reason:** The existing Hermes AI schema already owns projects, repositories, workflows, skills, activity and work intake.
- **Evidence:** Existing tables and foreign keys inspected in the Hermes AI project.

## ADR-004 — `hermes_pwa` module schema
- **Decision:** Store PWA-specific GitHub read models, sync state, chats, messages, settings and access in `hermes_pwa`.
- **Reason:** Prevents naming/data conflicts while allowing future Hermes applications to share the same backend.
- **Evidence:** Additive migration `20260805170000_add_hermes_pwa_module` applied successfully.

## ADR-005 — RLS and Realtime
- **Decision:** RLS is enabled on every PWA table; access is derived from `hermes_pwa.project_access`; only authorized read models are added to `supabase_realtime`.
- **Reason:** Supabase Data API grants and RLS jointly control object and row access. Server-side sync writes use service-role/Edge Function boundaries.
- **Evidence:** Post-migration table, policy and publication queries verified successfully.

## ADR-006 — Supabase over competing ORM source of truth
- **Decision:** Supabase migrations and RLS are authoritative; Prisma is an optional server-only typed ORM mapping over the existing Supabase database.
- **Reason:** Avoids schema drift and preserves Supabase Auth/RLS/Realtime/Storage behavior.
- **Evidence:** Prisma schema adjusted to map `hermes_pwa` and `project_management`; DATABASE.md documents the boundary.

## ADR-007 — Supabase replaces unsafe demo credentials
- **Decision:** Use Supabase Auth for GitHub/Google OAuth and session recovery. No demo provider secrets remain in source.
- **Reason:** The upstream Refine example contained credential-like demo values and was not safe to retain.
- **Evidence:** Source scan and auth boundary review.

## ADR-008 — Existing advisor warning deferred
- **Decision:** Do not move `pg_net` from `public` in this migration.
- **Reason:** Hermes AI already has webhook/outbox delivery infrastructure depending on database networking; changing extension placement without dependency analysis could break existing services.
- **Residual risk:** Supabase security advisor still reports `extension_in_public` for `pg_net`.
- **Next action:** Separate dependency audit and controlled remediation.

## Sources

- https://refine.dev/core/docs/
- https://refine.dev/core/docs/routing/integrations/next-js/
- https://nextjs.org/docs
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/api/using-custom-schemas
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/realtime
- https://supabase.com/docs/guides/storage
- https://www.prisma.io/docs/orm
- https://ai-sdk.dev/docs/introduction
- https://github.com/octokit/octokit.js

## Verification status
Backend schema migration and security boundary: verified. Application integration and production deployment: pending.

## ADR-009 — Premium SaaS workspace redesign
- **Decision:** Reframe the dashboard as a calm, high-density project workspace: persistent desktop navigation, responsive mobile navigation, clear page hierarchy, restrained indigo/cyan accent use, and explicit loading/error/empty states.
- **Reason:** The previous screen was a single dense dark canvas with weak navigation hierarchy, hardcoded secondary metrics, and limited interaction affordance. A premium SaaS experience needs predictable navigation, stronger grouping, accessible controls, and visual trust signals.
- **Alternatives rejected:** Decorative-only color refresh; replacing the existing data boundary with static demo content; introducing a new component library for a visual problem that Tailwind and the existing icon dependency can solve.
- **Evidence:** Local UI inspection of `apps/dashboard/src/components/project-dashboard.tsx`, `globals.css`, login and project detail routes; Next.js styling guidance and WCAG 2.2 focus-visible guidance consulted on 2026-08-05.
- **Scope:** Dashboard shell, project overview, login surface, and project-detail presentation. Backend contracts and canonical project loading remain unchanged.

## ADR-010 — Database-backed dashboard signals
- **Decision:** Derive all dashboard metrics and project operational signals at the server API boundary from the canonical project registry, task/activity tables, GitHub read models and chat records.
- **Reason:** Hardcoded metrics and demo activity misrepresent system state and violate the canonical-database rule. Empty data must remain truthful rather than being replaced with placeholders.
- **Alternatives rejected:** Static demo metrics, browser-side joins over privileged tables, and fabricated fallback records.
- **Evidence:** Live Supabase schema and row inspection on 2026-08-05; `/api/projects` now returns typed project, activity and totals records.
