# ── Base stage ──
FROM node:22-alpine AS base
WORKDIR /app

# ── Dependency stage (full deps for build) ──
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/coreApi/package.json ./apps/coreApi/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci --ignore-scripts

# ── Production dependency stage (runtime-only deps) ──
FROM base AS prod-deps
COPY package.json package-lock.json* ./
COPY apps/coreApi/package.json ./apps/coreApi/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN npm ci --ignore-scripts --omit=dev

# ── Build stage ──
FROM deps AS builder
COPY packages/shared-types/ ./packages/shared-types/
COPY apps/coreApi/ ./apps/coreApi/
RUN npm run build -w coreApi

# ── Runtime stage ──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini \
    && addgroup -S nodeadmin \
    && adduser -S -G nodeadmin nodeadmin

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/coreApi/node_modules ./apps/coreApi/node_modules
COPY --from=builder /app/apps/coreApi/package.json ./apps/coreApi/package.json
COPY --from=builder /app/apps/coreApi/dist ./apps/coreApi/dist
COPY --from=builder /app/packages/shared-types ./packages/shared-types
RUN chown -R nodeadmin:nodeadmin /app

EXPOSE 11451

USER nodeadmin
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/coreApi/dist/main.js"]
