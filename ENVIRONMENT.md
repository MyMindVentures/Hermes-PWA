# Environment

Hermes PWA uses the existing Hermes AI Supabase backend.

- Project ref: `kjjiufximimaxbeiqmce`
- Region: `eu-west-3`
- PWA schema: `hermes_pwa`
- Shared canonical project registry: `project_management`

Required public dashboard variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL`

Required server-only variables:

- `DATABASE_URL` — existing Hermes AI Supabase PostgreSQL connection, if Prisma is enabled
- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY`
- `AI_PROVIDER_API_KEY`
- `SESSION_SECRET` only if an additional server session layer is introduced

No new Supabase instance is required or permitted for this module. Do not place service-role keys, GitHub tokens, AI keys or database credentials in `NEXT_PUBLIC_*` variables.

OAuth providers, redirect URLs, Edge Function secrets and Storage bucket configuration must be managed in the existing Hermes AI Supabase project and deployment secret manager.

auth.users remains the identity source. Do not create a second user identity table.

The migration source is `supabase/migrations/20260805170000_add_hermes_pwa_module.sql`.

## Migration verification

The migration was applied successfully to `kjjiufximimaxbeiqmce`. Verified objects include the `hermes_pwa` schema, eight module tables, project-access RLS policies and five Realtime publication entries.

## Existing advisor finding

Supabase security advisor reports a pre-existing warning that `pg_net` is installed in `public`. It was not modified during this change; remediation requires separate dependency analysis because Hermes webhook delivery already uses the database event/outbox infrastructure.

## Source

Supabase API security documentation: https://supabase.com/docs/guides/api/securing-your-api
Supabase Auth documentation: https://supabase.com/docs/guides/auth
Supabase Realtime documentation: https://supabase.com/docs/guides/realtime
Supabase Storage documentation: https://supabase.com/docs/guides/storage
Supabase custom schemas documentation: https://supabase.com/docs/guides/api/using-custom-schemas

## Status

Backend schema and security boundary: implemented and verified. OAuth provider configuration, Edge Functions, live sync and deployment secrets remain environment-dependent.
