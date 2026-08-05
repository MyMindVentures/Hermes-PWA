# Dokploy Deployment

## Policy

Hermes PWA is deployed exclusively through Dokploy. Vercel, Netlify, Render and direct host deployments are not supported.

Dokploy hosts the Dockerized Next.js dashboard/API unit. Supabase project `kjjiufximimaxbeiqmce` remains the managed backend for Auth, PostgreSQL, RLS, Realtime, Storage and Edge Functions.

## Architecture

```text
GitHub main/approved release
        │ Dokploy Git webhook / auto-deploy
        ▼
Dokploy build server
        │ Dockerfile multi-stage build
        ▼
Dokploy application container
        │ HTTPS/domain/healthcheck/logs/rollback
        ▼
Hermes PWA dashboard + Next.js server routes
        │
        └── Hermes AI Supabase eu-west-3
```

The repository-root `Dockerfile` builds a production Next.js standalone artifact. `docker-compose.yml` is provided for Dokploy Compose deployments and local container smoke tests. No database container is defined: Supabase remains the single backend.

## Dokploy setup

1. Create or select the existing Dokploy project for Hermes AI.
2. Add an **Application** connected to the GitHub repository.
3. Select the approved branch or release tag.
4. Select **Dockerfile** build mode with repository root as build context.
5. Set Dockerfile path to `/Dockerfile`.
6. Set container port to `3000`.
7. Configure the domain/subdomain in Dokploy, for example `dashboard.example.com`.
8. Enable HTTPS/SSL through Dokploy/Traefik.
9. Configure health path `/api/health` and container healthcheck.
10. Add environment variables through Dokploy's environment manager.
11. Configure GitHub webhook/automatic deployment for approved branch pushes.
12. Enable deployment logs and retain the previous successful release for rollback.
13. Deploy a preview/staging branch first.
14. Run the smoke tests below before production promotion.

Dokploy UI labels and capabilities can vary by version. Verify the selected application exposes Dockerfile, domain, healthcheck, logs, automatic deployment and rollback settings before saving.

## Required environment variables

Use `.env.example` as the non-secret template. Set values in Dokploy, never in Git:

Public browser configuration:

- `NODE_ENV=production`
- `PORT=3000`
- `NEXT_PUBLIC_API_URL=/api`
- `NEXT_PUBLIC_SUPABASE_URL=https://kjjiufximimaxbeiqmce.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>`
- `SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service-role key>`

Server-only future integration values:

- `DATABASE_URL`
- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY`
- `GITHUB_WEBHOOK_SECRET`
- `AI_PROVIDER_API_KEY`

Never add a Supabase service-role key, GitHub private key or AI secret to a `NEXT_PUBLIC_*` variable. The service-role key is used only by the authenticated server route that reads the canonical project registry; it must never reach browser code.

## Automatic deployment lifecycle

```text
Pull request
  → CI build/typecheck/test/security checks
  → review and merge to approved branch
  → GitHub webhook reaches Dokploy
  → Dokploy builds Docker image
  → image healthcheck passes
  → Dokploy routes domain to new container
  → smoke checks / logs inspected
  → retain previous image for rollback
```

Use path filters or separate Dokploy applications when future services are added. The current dashboard and server API routes deploy as one unit; GitHub workers and Edge Functions should become separate Dokploy applications only when their runtime and lifecycle differ.

## Zero-downtime and resource settings

- Use Dokploy rolling/zero-downtime deployment mode where supported.
- Keep at least one healthy previous container during replacement.
- Set CPU and memory limits appropriate to the Dokploy host; begin with a measured staging baseline.
- Do not run Prisma migrations automatically inside the web container startup command.
- Apply Supabase migrations through the reviewed Supabase migration workflow before application promotion.
- Set restart policy to `unless-stopped`.
- Use the Docker healthcheck in `Dockerfile` and Compose.
- Keep application logs on stdout/stderr for Dokploy collection.
- Avoid local persistent state in the container; use Supabase Storage/database.

## Health checks

```text
GET /api/health → 200 JSON response
```

The Docker healthcheck polls `http://127.0.0.1:3000/api/health` every 30 seconds with a 20-second startup grace period and three retries.

A future readiness endpoint should additionally check non-secret configuration and Supabase connectivity without exposing credentials or failing startup when an optional integration is disabled.

## Local Docker validation

```bash
docker build -t hermes-pwa:local .
docker run --rm -p 3000:3000 --env-file .env.local hermes-pwa:local
curl --fail http://127.0.0.1:3000/api/health
```

Compose validation:

```bash
docker compose config
docker compose up --build
curl --fail http://127.0.0.1:3000/api/health
docker compose down
```

## Rollback

1. Stop automatic deployment if a release is unhealthy.
2. Inspect Dokploy deployment logs and healthcheck output.
3. Select the previous successful image/release in Dokploy.
4. Restore routing to the previous healthy container.
5. Confirm `/api/health`, login route and dashboard smoke flow.
6. Keep the failed image and logs for diagnosis.
7. Do not roll back a database migration automatically; use a reviewed backward-compatible migration plan.

## SSL and domains

Dokploy/Traefik owns TLS certificates and domain routing. Configure DNS to the Dokploy server, attach the domain to the application, enable HTTPS and verify the certificate from an external client. OAuth redirect URLs in Supabase must exactly match the deployed HTTPS origin and `/auth/callback` path.

## Observability

- Dokploy container logs: stdout/stderr
- Dokploy deployment/build logs
- `/api/health` uptime checks
- Supabase Auth, Postgres, Realtime, Storage and Edge Function logs
- Future Sentry/OpenTelemetry integration through the server boundary

Redact authorization headers, cookies, Supabase tokens, GitHub tokens and AI prompts containing sensitive data.

## Current deployment status

Docker/Dokploy artifacts are implemented locally. No Dokploy deployment has been executed because Dokploy server access, GitHub webhook configuration, domain, environment secrets and production approval are not available in this session.

Status: **READY FOR STAGING CONFIGURATION — NOT PRODUCTION DEPLOYED**

## Sources

- Dokploy documentation: https://docs.dokploy.com/docs/core
- Dokploy Applications: https://docs.dokploy.com/docs/core/applications
- Dokploy Docker Compose: https://docs.dokploy.com/docs/core/docker-compose
- Dokploy Auto Deploy: https://docs.dokploy.com/docs/core/auto-deploy
- Docker multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Docker Compose: https://docs.docker.com/compose/
- Next.js self-hosting: https://nextjs.org/docs/app/getting-started/deploying
- Supabase deployment/migrations: https://supabase.com/docs/guides/deployment
