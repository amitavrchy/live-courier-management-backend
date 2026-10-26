import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { AppDb, db } from './db';

/** Nest DI wrapper around the Prisma Client instance from `./db`. */
@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly db: AppDb = db;

  async onModuleDestroy(): Promise<void> {
    await this.db.$disconnect();
  }
}
