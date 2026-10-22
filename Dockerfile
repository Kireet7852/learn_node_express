# ── Stage 1: Install dependencies ──────────────────────────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy only the files needed for dependency installation
COPY package.json bun.lock ./
COPY prisma/schema.prisma prisma/schema.prisma
COPY prisma.config.ts prisma.config.ts

# Install all dependencies (including devDependencies for prisma generate)
RUN bun install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM oven/bun:1 AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate the Prisma client
RUN bun run db:generate

# ── Stage 3: Production ───────────────────────────────────────────────────────
FROM oven/bun:1-slim AS production

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Copy application code and dependencies
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

# Create the data directory for SQLite and give ownership to appuser
RUN mkdir -p /app/data && chown -R appuser:appgroup /app/data

# Switch to non-root user
USER appuser

# Expose the default port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run migrations and start the server
CMD ["sh", "-c", "bun run db:deploy && bun run start"]
