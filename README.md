# Live Courier Management Backend

NestJS API with PostgreSQL, Prisma 6, Redis/BullMQ, JWT authentication, and SMTP email.
Requires Node.js 22 and Docker with Compose v2 or newer.

## Local development

```sh
cp .env.example .env
# Edit .env: use a unique JWT_SECRET and set SMTP credentials if needed.
npm ci
npm run docker:db
npx prisma migrate deploy
npm run start:dev
```

- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/docs
- Health: http://localhost:3001/api/v1/health (process health, not database readiness)

Development PostgreSQL and Redis ports bind to localhost. `DATABASE_URL` in
`.env.example` targets development PostgreSQL at localhost:5433.
Run `npm run db:seed` locally only when demo users are wanted; change the sample
seed passwords first. Docker startup does not seed demo accounts.

## Docker stack

```sh
cp .env.example .env
# Set a strong JWT_SECRET and POSTGRES_PASSWORD before exposing the app.
docker compose up -d --build --wait
docker compose logs -f app
```

Compose starts the API, PostgreSQL, and Redis with healthchecks, restart policies,
and persistent data volumes. PostgreSQL/Redis have no published ports in this
stack. The API defaults to port 3001. JWT and optional SMTP configuration are
passed from `.env` to the app; the container uses the internal database/Redis hosts.
The image runs as a non-root user and includes Prisma and OpenSSL at runtime.

```sh
docker compose down          # keep database and Redis data
# docker compose down --volumes  # DELETES persistent data; use only intentionally
```

## Database migrations

Container startup waits for PostgreSQL, then runs `prisma migrate deploy`.
A failed migration stops startup. Set `RUN_DB_INIT=false` only when migrations
are applied separately. Production startup never runs `prisma db push`.
For a schema change, create and review a migration against a development DB:

```sh
npx prisma migrate dev --name describe_change
# Commit both prisma/schema.prisma and prisma/migrations/.
```

An initial migration is included for new databases. If an existing database was
created with `prisma db push`, back it up and confirm its schema matches the
initial migration before baselining it (against that specific database):

```sh
npx prisma migrate resolve --applied 20261022000000_initial
npx prisma migrate deploy
```

Do not baseline an empty or mismatched database. Back up production data before
migration; database rollback requires a separate reviewed recovery plan.

## CI and Docker image delivery

GitHub Actions workflow: `.github/workflows/ci.yml`.
Pull requests and pushes to `main` run:

1. Clean dependency installation, Prisma validation, migration against a fresh
   PostgreSQL service, TypeScript checks, API/database e2e tests, and app build.
2. Docker image build and Compose validation.
3. Full-stack smoke test using that image, including container health and
   applied migration status.

Only after these pass, pushes to `main` publish the tested image to:

```text
ghcr.io/amitavrchy/live-courier-management-backend:latest
ghcr.io/amitavrchy/live-courier-management-backend:<full-commit-sha>
```

PRs do not publish. The workflow can also be run manually from `main`.
Publishing uses the built-in `GITHUB_TOKEN` with `packages: write`; no Docker Hub
account or extra registry secret is required. GitHub Actions must be enabled and
organization/package policy must allow publication. Images target linux/amd64.
No automatic server deployment is configured.

## Run a published image

On a Docker host, place `docker-compose.yml` and a configured `.env` together.
Set `APP_IMAGE` in `.env` to an immutable full commit SHA tag from a successful
pipeline. For a private GHCR package, log in first with a GitHub token that has
`read:packages` access, using `docker login ghcr.io` with `--password-stdin`.
Then run:

```sh
docker compose pull app
docker compose up -d --no-build --wait
```

Use HTTPS through your reverse proxy and configure `APP_LOGIN_URL` for the
public app URL. Keep `.env` and registry credentials on the server, outside Git.

## Checks

```sh
npx tsc --noEmit
npm run build
# Requires a migrated DATABASE_URL and a running Redis service:
npm run test:e2e -- --runInBand
```
