# =============================================================================
# Stage 1 — deps
#   Install only production node_modules with a clean npm ci.
#   Kept separate so the expensive install layer is cached independently.
# =============================================================================
FROM node:20-alpine AS deps

# libc6-compat is needed by some native Node addons on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifests first so this layer is only invalidated when deps change
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma

# Install all deps (we need devDeps for the build stage)
RUN npm ci


# =============================================================================
# Stage 2 — builder
#   Compile the Next.js app and generate the Prisma client.
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Re-use the installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source
COPY . .

# Generate the Prisma client for the linux-musl-openssl-3.0.x target
RUN npx prisma@6.6.0 generate

# Build Next.js — produces .next/standalone thanks to output: "standalone"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# =============================================================================
# Stage 3 — runner  (the final, minimal production image)
#   Uses only the standalone output + static assets.
#   No node_modules, no source code, no devDependencies.
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Environment defaults — override these at runtime via env vars / secrets
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# ── Copy the standalone server bundle ────────────────────────────────────────
# .next/standalone contains server.js + a minimal node_modules tree
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# ── Copy static assets (CSS, JS chunks, images) ──────────────────────────────
# Must sit at .next/static inside the standalone output dir
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ── Copy the public folder (favicon, og images, etc.) ───────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ── Copy Prisma schema + migrations so migrate deploy can run at startup ─────
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# ── Copy the generated Prisma client (linux-musl binary) ────────────────────
# The standalone bundle already includes it, but we copy explicitly to be safe
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Switch to the non-root user before running anything
USER nextjs

EXPOSE 3000

# Health-check so orchestrators know when the app is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Entrypoint: run pending migrations, then start the server.
# Using sh -c so we can chain two commands with &&.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
