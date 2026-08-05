# Testing

## Current gates
- `pnpm --filter @hermes/dashboard typecheck`
- `pnpm --filter @hermes/dashboard build`
- `pnpm --filter @hermes/dashboard lint`
- `pnpm --filter @hermes/dashboard test`
- `pnpm --filter @hermes/dashboard test:e2e`

## Test strategy
- Unit: gateway URL encoding, prompt scoping, status mapping and project filters.
- Integration: Supabase auth callbacks, Refine data provider, Prisma repositories and GitHub sync idempotency.
- E2E: authenticated dashboard redirect, project card navigation, split view, chat Enter behavior, responsive layout and logout.
- Security: RLS policy tests, webhook signature tests, secret scan and dependency audit.

Current integration and E2E suites are not yet implemented because external Supabase/GitHub/AI environments are not configured. This is a documented blocker, not a pass.