# Prisma Client

This application uses the standard Prisma Client with PostgreSQL.

The database schema is [`prisma/schema.prisma`](prisma/schema.prisma). After changing it, regenerate the typed client:

```bash
npx prisma generate
```

For local schema synchronization, run:

```bash
npx prisma db push
```

Use migrations for versioned database changes:

```bash
npx prisma migrate dev --name describe_your_change
```

The Nest database instance is in [`src/prisma/db.ts`](src/prisma/db.ts):

```ts
import { db } from './src/prisma/db';

const user = await db.users.findUnique({
  where: { email: 'alice@example.com' },
});
```
