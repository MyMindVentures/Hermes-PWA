# Database

## Existing backend

Hermes PWA uses the existing Supabase project **Hermes AI**:

- Project ref: `kjjiufximimaxbeiqmce`
- Region: `eu-west-3`
- Status at verification: `ACTIVE_HEALTHY`
- Existing shared project registry: `project_management`

No new Supabase project was created.

## Shared-module strategy

`project_management` is the existing Hermes AI project registry. It already contains the canonical `projects`, `repositories`, activity, workflow and work-intake tables. Hermes PWA references those records rather than creating a competing Projects table.

The PWA-specific module is isolated under `hermes_pwa`:

- `project_access` — user access to shared Hermes projects
- `github_repositories` — GitHub read model and sync state
- `github_issues` — synchronized issue read model
- `github_pull_requests` — synchronized pull-request read model
- `github_sync_runs` — idempotent sync jobs and diagnostics
- `chats` — project-scoped conversations
- `messages` — persisted chat messages
- `settings` — user/project preferences

All foreign keys point to existing `project_management.projects` and `auth.users` where appropriate.

## Migration

Applied successfully to the existing Hermes AI project:

```text
20260805170000_add_hermes_pwa_module
```

The local source is available at:

```text
supabase/migrations/20260805170000_add_hermes_pwa_module.sql
```

## Authorization model

- `auth.users` remains the identity source.
- Users receive access through `hermes_pwa.project_access`.
- `hermes_pwa.has_project_access(uuid)` is a `security definer` helper with a restricted search path.
- All PWA tables have RLS enabled.
- Browser-authenticated users receive only project-scoped reads/writes allowed by RLS.
- Service-role access is reserved for server-side sync jobs and Edge Functions.
- GitHub tokens and AI provider credentials are not stored in client-visible tables.

## Realtime

The following PWA read models were added to `supabase_realtime`:

- `github_repositories`
- `github_issues`
- `github_pull_requests`
- `chats`
- `messages`

GitHub sync jobs remain server-side. Realtime only distributes authorized persisted state.

## Storage

The existing Supabase Storage service remains shared. Future PWA buckets must use a prefix such as `hermes-pwa/<project-id>/...` and Storage RLS must verify project access from the object path. No new bucket was created in this migration.

## Edge Functions

Future Edge Functions should handle GitHub webhook signature verification, GitHub synchronization using server-side installation credentials, Vercel AI SDK streaming/provider calls, and document ingestion. Functions must validate JWTs, enforce project access, redact secrets and be idempotent.

## Existing security finding

Supabase security advisors reported one warning: `pg_net` is installed in the `public` schema. This is pre-existing infrastructure and was not changed by the PWA migration. It should be remediated separately after verifying dependent webhook/outbox functions.

## Verification

Verified after migration:

- PWA schema exists
- PWA tables exist
- RLS is enabled on all PWA tables
- RLS policies exist for project access, repositories, issues, pull requests, sync runs, chats, messages and settings
- Realtime publication includes the five intended read models
- Existing `project_management` tables remain unchanged
- Existing project-management tables already have RLS and service-role policies

The migration intentionally does not seed users, projects or repository credentials.

## Rollback

Before a production rollback, remove the `hermes_pwa` objects in reverse dependency order and remove the five Realtime publication entries. Because the migration is additive and isolated, the preferred rollback is application feature disablement followed by reviewed schema rollback.

Destructive rollback must be reviewed before execution.

## Sources

- Supabase API security: https://supabase.com/docs/guides/api/securing-your-api
- Supabase custom schemas: https://supabase.com/docs/guides/api/using-custom-schemas
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Realtime: https://supabase.com/docs/guides/realtime
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase security advisor: https://supabase.com/docs/guides/database/database-linter

## Status

Database foundation: **IMPLEMENTED AND VERIFIED**. Application API wiring, OAuth provider configuration, GitHub sync workers and Edge Functions remain separate delivery items.
