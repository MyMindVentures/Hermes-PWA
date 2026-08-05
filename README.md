# Hermes AI Project Dashboard

Monorepo foundation for the Hermes AI project command center, bootstrapped from the Refine `with-nextjs-next-auth` example at pinned upstream revision `0d6d062e73189aa196a5ffbd9a8939134f88bd2d`.

## Structure

```text
apps/dashboard  Next.js + Refine user-facing dashboard
apps/api        server-side integration and Prisma boundary
packages/       auth, AI and GitHub typed gateways
features/       feature ownership boundaries
components/     shared UI component boundary
```

## Current status
The Refine/Next.js foundation is installed and the dashboard loads the five visible application projects from the canonical Supabase `project_management.projects` registry: Parallax Studio, CostaPulse, WildSkyRide, BankruptTo1Million and Hermes PWA. Supabase OAuth, live GitHub synchronization and AI streaming require environment configuration and backend route implementation before production use.

## Deployment

Deployment is exclusively through Dokploy. The repository includes a production multi-stage Dockerfile, Compose configuration, Docker ignore rules, healthcheck and Dokploy runbook. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Commands

```bash
pnpm install
pnpm --filter @hermes/dashboard dev
pnpm --filter @hermes/dashboard typecheck
pnpm --filter @hermes/dashboard build
```

## Environment

Copy `.env.example` to `.env.local` and configure only public Supabase URL/key in the dashboard. Keep `DATABASE_URL`, GitHub tokens, AI keys and session secrets server-side.

## Sources

- Refine v5 docs: https://refine.dev/core/docs/
- Refine Next.js integration: https://refine.dev/core/docs/routing/integrations/next-js/
- Next.js docs: https://nextjs.org/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Prisma ORM: https://www.prisma.io/docs/orm
- TanStack Query: https://tanstack.com/query/latest/docs/framework/react/overview
- Vercel AI SDK: https://ai-sdk.dev/docs/introduction
- Octokit: https://github.com/octokit/octokit.js

## Security

The upstream demo contained credential-like values. They were removed and replaced with Supabase environment boundaries. Never commit provider credentials or refresh tokens.

See `ARCHITECTURE.md`, `DECISIONS.md`, `SECURITY.md`, `TESTING.md`, and `ROADMAP.md`.
