# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /workspace

FROM base AS dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/*/package.json packages/
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/apps/dashboard/node_modules ./apps/dashboard/node_modules
COPY --from=dependencies /workspace/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /workspace/packages ./packages
COPY . .
RUN pnpm --filter @hermes/dashboard build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/dashboard/.next/static ./apps/dashboard/.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/dashboard/server.js"]

# Dokploy deploys this image from the repository root. The Next.js app contains
# the frontend and authenticated server/API routes in the same independently
# deployable unit; future workers can be added as separate Dokploy services.
