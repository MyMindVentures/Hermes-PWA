# Roadmap

1. Complete Supabase OAuth callback and middleware session refresh.
2. Add API routes with project ownership and Prisma repositories.
3. Add GitHub App authentication, Octokit sync jobs and webhooks.
4. Add Vercel AI SDK streaming route and persisted project chats.
5. Add shadcn/ui design primitives, Monaco code viewer, markdown sanitization and toasts.
6. Add Vitest/Playwright suites and CI.
7. Deploy dashboard/API to Vercel and verify production smoke flows.

Non-goal: ship fake live integrations or hardcoded credentials.

# Deployment

Dashboard deploy target: Vercel (pending project configuration). API may deploy as Next.js routes or a separate service after contract validation. Required environment values are documented in `.env.example`. Use preview deployments for migrations and integration testing; production deployment is blocked until Supabase, GitHub App and AI credentials are configured and tests pass.

# Changelog

## 0.2.0
- Rebased architecture on pinned Refine Next.js/auth foundation.
- Added pnpm workspace monorepo boundaries.
- Added Supabase auth gateway boundary, Prisma schema, GitHub gateway and AI context contract.
- Added Refine dashboard project card vertical slice and PWA manifest.
- Removed unsafe upstream demo credential values.

# Dependencies

The authoritative dependency manifests are `package.json`, `pnpm-workspace.yaml`, `apps/dashboard/package.json` and package manifests under `packages/*`. Lockfile generation is pending dependency installation in the configured pnpm environment. Review all versions and audit output before release.

# Environment

Use `.env.example`. Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_API_URL` may reach the browser. All database, GitHub, AI and session secrets are server-only.

# Troubleshooting

- If pnpm is unavailable, enable Corepack or install the pinned package manager version.
- If Next cannot resolve aliases, verify `apps/dashboard/tsconfig.json` paths and run from workspace root.
- If OAuth does not return, verify Supabase provider settings and redirect URLs.
- If GitHub sync fails, verify server-side App installation permissions and webhook signatures.
- If refresh returns 404, configure the hosting platform's SPA/Next route handling.
