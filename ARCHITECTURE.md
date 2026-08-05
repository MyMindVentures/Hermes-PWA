# Architecture

## Foundation
Hermes is bootstrapped from the Refine open-source monorepo's Next.js + auth example, pinned to commit `0d6d062e73189aa196a5ffbd9a8939134f88bd2d`. The foundation provides Refine resource routing, auth-provider interfaces, data-provider interfaces and themed CRUD layout patterns.

## Runtime topology

```text
Next.js App Router / Refine dashboard
  ├─ Supabase Auth + session middleware
  ├─ TanStack Query through Refine data provider
  ├─ typed packages/auth, packages/projects, packages/chat
  └─ server API boundary
       ├─ Supabase Auth/PostgreSQL/RLS/Realtime/Storage
       ├─ Prisma → Supabase PostgreSQL (server-only, optional typed ORM)
       ├─ Octokit → GitHub API / webhooks
       └─ Vercel AI SDK → provider streaming
```

## Module ownership
- `apps/dashboard`: browser UI, routes, Refine resources, auth entrypoint.
- `apps/api`: server-only routes, Supabase/Prisma repositories, jobs and external integrations.
- `packages/auth`: Supabase session contracts and auth gateway.
- `packages/github`: server-side Octokit gateway contracts.
- `packages/ai`: project-context and streaming contracts.
- `packages/database`: Prisma client boundary.
- `features/*`: future feature-specific UI/domain modules.
- `components/*`: reusable visual components.

## Trust boundaries
Browser code may use public Supabase URL and publishable key only. GitHub access tokens, OAuth exchange, Prisma/database credentials and AI provider keys are server-only. Project authorization must be checked before every project-scoped read, chat stream, sync job or mutation.

## Quality attributes
- Security: Supabase Auth, server-only secrets, RLS, project ownership checks, audit events.
- Performance: Next.js server rendering, TanStack Query caching, route-level lazy loading and streaming AI responses.
- Reliability: GitHub sync jobs are idempotent and record `syncedAt`; stale data is labeled.
- Maintainability: Refine resources and typed gateways prevent UI/provider coupling.

## Existing Hermes AI backend
The PWA is a module in the existing Hermes AI Supabase project `kjjiufximimaxbeiqmce`. The shared canonical project registry is `project_management`; PWA-specific GitHub read models and chat state live in `hermes_pwa`. The migration is additive and references existing project/user identities.

## Current gap
The database module is applied and verified. Live application API routes, GitHub sync Edge Functions, AI streaming, OAuth provider configuration and contract tests remain before production readiness.

## Sources
See `DECISIONS.md` for source-backed choices.
