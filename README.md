# AndYesQo API

Fleet and operations API. NestJS application structured as shared code (`common`), technical cross-cutting concerns (`core`), infrastructure (`lib`), and business features (`main`).

## Layout

```
src/
├── main.ts
├── app.module.ts
├── app.controller.ts          # health check
├── app.service.ts
├── common/                    # pure shared code: DTOs, enums, helpers
│   ├── dto/
│   ├── enum/
│   └── utils/
├── core/                      # app-wide HTTP, authn primitives, errors
│   ├── core.module.ts         # global interceptor and exception filter
│   ├── decorator/
│   ├── error/
│   ├── filter/
│   ├── interceptor/
│   ├── jwt/
│   └── middleware/
├── lib/                       # infrastructure modules
│   ├── lib.module.ts
│   ├── prisma/
│   ├── queue/                 # BullMQ / Redis connection
│   ├── mail/
│   └── seed/                  # CLI seed; not imported by AppModule
└── main/
    ├── main.module.ts         # imports business feature modules
    └── auth/
        ├── auth.module.ts
        ├── controllers/
        ├── services/
        ├── dto/
        ├── decorators/
        └── guards/
prisma/
├── schema/                    # multi-file Prisma schema
├── migrations/
└── generated/                 # prisma generate output; do not edit
```

`AppModule` imports `ConfigModule`, `CoreModule`, `LibModule`, and `MainModule`. `MainModule` imports feature modules. `LibModule` imports and re-exports `PrismaModule`, `QueueModule`, and `MailModule`. Feature modules import `LibModule` when they need those providers. Modules are not marked global unless a third-party package already does that (`ConfigModule`, BullMQ `forRoot`).

## Where new code goes

| Kind of code | Location |
| --- | --- |
| Business feature (fleet, delivery, roster, …) | `src/main/<feature>/` with `<feature>.module.ts`, `controllers/`, `services/`, `dto/` |
| Feature DTOs | that feature's `dto/` directory. Use `create-`, `update-`, and `query-` names for CRUD features. Auth keeps `login.dto.ts` and `register.dto.ts` because those are the operations. |
| Large feature service | split by responsibility inside `services/`, for example `auth-login.service.ts` |
| Shared injectable infrastructure | `src/lib/<capability>/` and register it in `LibModule` with explicit `exports` |
| Pure helper, shared DTO, or enum | `src/common` |
| HTTP filter, interceptor, middleware, pipe, JWT primitives | `src/core` |
| Prisma models | `prisma/schema/<domain>.prisma`. Shared enums stay in `common.prisma`. |

Register every new feature module in `MainModule`. Keep controllers to HTTP and delegation. Put business rules in services.

`src/main/users` is the empty scaffold from the initial Nest app. It is not registered in `MainModule` and has no routes. Implement it there, then import `UsersModule` from `MainModule`.

Optional capabilities that are not in the tree yet: file storage (`src/lib/file`), websockets (`src/core/socket`, `src/lib/queue/queue.gateway.ts`), and shared utility services (`src/lib/utils`). Add them when a feature needs them. Do not add empty modules or new infrastructure dependencies only to fill the tree.

`src/lib/seed` holds the seed implementation. Run it with `npm run db:seed`. Do not import `SeedModule` from `AppModule`; startup must not seed the database.

## Imports

Internal imports use the `@/` alias, mapped to `src/*` in `tsconfig.json`, Jest, and the Nest webpack build. The generated Prisma Client is imported as `@prisma-gen` (`prisma/generated/client`). Webpack leaves that package external so `dist/main.js` loads `../prisma/generated/client` at runtime.

## Prisma

Prisma ORM 6.19. Provider, models, relations, and migrations are unchanged. `prisma.config.ts` points the CLI at `prisma/schema` and `prisma/migrations`. The client is generated to `prisma/generated` and is not committed. `npm install` runs `prisma generate`.

Do not hand-edit `prisma/generated`. After a schema change, generate the client and add a migration with the Prisma CLI. Do not reset the database from the app.

## Response contract

Existing HTTP responses stay in this shape:

- Success: `{ success, statusCode, message, data, meta, pagination? }`
- Error: `{ success: false, statusCode, message, error: { code, details? }, meta }`

Build success payloads with `ok()` and `created()` from `@/common`. Errors thrown as Nest HTTP exceptions are normalized by `AllExceptionsFilter`.

## Scripts

```bash
npm run start:dev
npm run build
npm run lint
npm test
npm run test:e2e
npm run prisma:generate
npm run db:init          # prisma db push — local schema sync only
npm run db:seed          # prisma db seed
```

Environment variable names are listed in `src/common/enum/env.enum.ts` and `.env.example`.
