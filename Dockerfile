# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:22-bookworm-slim AS base
WORKDIR /app

# ---- Dependencies (all, for build) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production ----
FROM base AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init curl \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
  && chown -R node:node /app

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/" || exit 1

ENTRYPOINT ["dumb-init", "--", "entrypoint.sh"]
CMD ["node", "dist/main.js"]
