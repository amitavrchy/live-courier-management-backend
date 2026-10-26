import { Module } from '@nestjs/common';
import { PrismaModule } from '@/lib/prisma/prisma.module';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { SeedService } from './seed.service';

/**
 * Available for an explicit Nest context. The running API does not import this
 * module, so startup does not seed the database.
 */
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: SeedService,
      useFactory: (prisma: PrismaService) => new SeedService(prisma.db),
      inject: [PrismaService],
    },
  ],
  exports: [SeedService],
})
export class SeedModule {}
