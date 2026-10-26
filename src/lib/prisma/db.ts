import 'dotenv/config';
import { PrismaClient } from '@prisma-gen';

export const db = new PrismaClient();

export type AppDb = typeof db;
