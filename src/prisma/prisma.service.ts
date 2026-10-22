import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { db } from './db';

export type AppDb = typeof db;

/** Nest DI wrapper around the Prisma Client instance from `./db`. */
@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly db: AppDb = db;

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect();
  }
}
