# Security

## Implemented controls
- Upstream hardcoded demo credentials and provider secrets removed.
- `.env.example` contains names only; no real values.
- Auth gateway is Supabase-oriented and server session reader uses `getUser()`.
- GitHub and AI integrations are isolated behind server-boundary packages.
- Project context prompt explicitly scopes model context to an authorized project.

## Required before production
- Configure Supabase GitHub/Google OAuth redirect URLs.
- Use RLS policies for every tenant-owned table.
- Verify project ownership on every API request and stream.
- Keep GitHub App private key, database URL, AI key and session secrets in Vercel/Supabase secret managers.
- Add CSRF, rate limits, audit logs and webhook signature verification.
- Add dependency, secret and CodeQL scans in CI.
- Rotate any credentials that may have existed in the upstream demo environment.

Never use client-side GitHub tokens for privileged repository operations.

## Reporting
Report security issues privately to repository maintainers.
