import 'dotenv/config';
import { PrismaClient } from '@prisma-gen';
import { SeedService } from '../src/lib/seed/seed.service';

const prisma = new PrismaClient();
const seed = new SeedService(prisma);

seed
  .run()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
